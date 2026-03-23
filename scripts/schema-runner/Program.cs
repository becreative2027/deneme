using Npgsql;

const string connectionString = "Host=ep-bitter-cloud-a9xk9knc-pooler.gwc.azure.neon.tech;Port=5432;Database=neondb;Username=neondb_owner;Password=npg_NamhpWnicC82;SSL Mode=Require;Trust Server Certificate=true";

var mode = args.Length > 0 ? args[0] : "schema";

// If arg is a direct .sql file path, use it; otherwise resolve by mode keyword
string sqlPath;
string sqlFile;
if (mode.EndsWith(".sql", StringComparison.OrdinalIgnoreCase))
{
    sqlPath = Path.IsPathRooted(mode) ? mode : Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), mode));
    sqlFile = Path.GetFileName(sqlPath);
}
else
{
    sqlFile = mode == "migrations" ? "mark-migrations.sql" : "init-schema.sql";
    sqlPath = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", sqlFile);
    if (!File.Exists(sqlPath))
        sqlPath = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", sqlFile));
}

Console.WriteLine($"Reading SQL from: {sqlPath}");
var sql = File.ReadAllText(sqlPath);

Console.WriteLine("Connecting to Neon PostgreSQL...");
await using var conn = new NpgsqlConnection(connectionString);
await conn.OpenAsync();
Console.WriteLine("Connected successfully.");

Console.WriteLine($"Applying {sqlFile}...");

// Split on semicolons but keep empty batches out
var statements = sql.Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    .Where(s => !string.IsNullOrWhiteSpace(s))
    .ToList();

int success = 0, skipped = 0;
foreach (var statement in statements)
{
    try
    {
        await using var cmd = new NpgsqlCommand(statement, conn);
        await cmd.ExecuteNonQueryAsync();
        success++;
        Console.WriteLine($"  OK: {statement[..Math.Min(80, statement.Length)].Replace('\n', ' ')}");
    }
    catch (PostgresException ex) when (ex.SqlState is "42P07" or "42710" or "23505" or "42P04")
    {
        Console.WriteLine($"  Skipped (already exists): {statement[..Math.Min(60, statement.Length)].Replace('\n', ' ')}...");
        skipped++;
    }
}

Console.WriteLine($"\nDone. {success} statements applied, {skipped} skipped.");

if (mode == "schema")
{
    Console.WriteLine("\nVerifying schema...");

    var verifyQueries = new (string schema, string table)[]
    {
        ("geo", "languages"), ("geo", "countries"), ("geo", "cities"), ("geo", "districts"),
        ("place", "places"), ("place", "place_translations"), ("place", "place_scores"),
        ("label", "label_categories"), ("label", "labels"), ("label", "place_labels"), ("label", "label_keywords"),
    };

    foreach (var (schema, table) in verifyQueries)
    {
        await using var cmd = new NpgsqlCommand($"SELECT COUNT(*) FROM {schema}.{table}", conn);
        var count = await cmd.ExecuteScalarAsync();
        Console.WriteLine($"  {schema}.{table}: {count} rows");
    }
}

namespace SpotFinder.AdminService.Domain.Entities.Write;

public sealed class AdminCityWrite
{
    public int       Id          { get; set; }
    public int       CountryId   { get; set; }
    public DateTime  CreatedAt   { get; set; } = DateTime.UtcNow;
    public string?   CreatedBy   { get; set; }

    /// <summary>DB-managed optimistic concurrency token (trigger-updated bytea column).</summary>
    public byte[] RowVersion { get; set; } = [];

    public List<AdminCityTranslationWrite> Translations { get; set; } = [];
}

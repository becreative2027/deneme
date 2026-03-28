namespace SpotFinder.AdminService.Domain.Entities.Write;

/// <summary>Admin write entity — maps to place.places. Used only for write operations.</summary>
public sealed class AdminPlaceWrite
{
    public Guid         Id                  { get; set; } = Guid.NewGuid();
    public string?      GooglePlaceId       { get; set; }
    public int?         CountryId           { get; set; }
    public int?         CityId              { get; set; }
    public int?         DistrictId          { get; set; }
    public double?      Latitude            { get; set; }
    public double?      Longitude           { get; set; }
    public decimal?     Rating              { get; set; }
    public int?         UserRatingsTotal    { get; set; }
    public string       ParkingStatus       { get; set; } = "unavailable";
    public string?      Source              { get; set; }
    public string?      CoverImageUrl       { get; set; }
    public string?      MenuUrl             { get; set; }
    public List<string> MenuImageUrls       { get; set; } = [];
    public bool         IsDeleted           { get; set; }
    public DateTime     CreatedAt           { get; set; } = DateTime.UtcNow;
    public DateTime?    UpdatedAt           { get; set; }
    public string?      CreatedBy           { get; set; }
    public string?      UpdatedBy           { get; set; }
    public DateTime?    DeletedAt           { get; set; }
    public string?      DeletedBy           { get; set; }

    /// <summary>DB-managed optimistic concurrency token (trigger-updated bytea column).</summary>
    public byte[] RowVersion { get; set; } = [];

    // Navigation for translations (owned)
    public List<AdminPlaceTranslationWrite> Translations { get; set; } = [];
}

namespace SpotFinder.AdminService.Domain.Entities.Write;

public sealed class AdminLabelWrite
{
    public int       Id          { get; set; }
    public int       CategoryId  { get; set; }
    public string    Key         { get; set; } = string.Empty;
    public bool      IsActive    { get; set; } = true;
    public DateTime  CreatedAt   { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt   { get; set; }
    public string?   CreatedBy   { get; set; }
    public string?   UpdatedBy   { get; set; }
    public bool      IsDeleted   { get; set; }
    public DateTime? DeletedAt   { get; set; }
    public string?   DeletedBy   { get; set; }

    /// <summary>DB-managed optimistic concurrency token (trigger-updated bytea column).</summary>
    public byte[] RowVersion { get; set; } = [];

    public List<AdminLabelTranslationWrite> Translations { get; set; } = [];
}

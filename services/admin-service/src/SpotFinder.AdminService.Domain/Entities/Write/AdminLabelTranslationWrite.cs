namespace SpotFinder.AdminService.Domain.Entities.Write;

public sealed class AdminLabelTranslationWrite
{
    public int    Id          { get; set; }
    public int    LabelId     { get; set; }
    public int    LanguageId  { get; set; }
    public string DisplayName { get; set; } = string.Empty;
}

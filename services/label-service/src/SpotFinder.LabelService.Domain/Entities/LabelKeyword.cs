using SpotFinder.BuildingBlocks.Domain;

namespace SpotFinder.LabelService.Domain.Entities;

public sealed class LabelKeyword : Entity<int>
{
    public int LabelId { get; private set; }
    public int LanguageId { get; private set; }
    public string Keyword { get; private set; } = string.Empty;
    public decimal Confidence { get; private set; } = 1.0m;
    public string? Source { get; private set; }

    private LabelKeyword() { }

    public static LabelKeyword Create(int labelId, int languageId, string keyword, decimal confidence = 1.0m, string? source = null)
        => new() { LabelId = labelId, LanguageId = languageId, Keyword = keyword, Confidence = confidence, Source = source };
}

using SpotFinder.BuildingBlocks.Application;

namespace SpotFinder.LabelService.Application.Features.Labels.Queries.GetLabelsByCategory;

public sealed record GetLabelsByCategoryQuery(int CategoryId, int LanguageId = 1) : IQuery<IReadOnlyList<LabelDto>>;
public sealed record LabelDto(int Id, string Key, string DisplayName, int CategoryId);

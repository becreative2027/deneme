using SpotFinder.BuildingBlocks.Application;

namespace SpotFinder.LabelService.Application.Features.Categories.Queries.GetAllCategories;

public sealed record GetAllCategoriesQuery(int LanguageId = 1) : IQuery<IReadOnlyList<CategoryDto>>;
public sealed record CategoryDto(int Id, string Key, string DisplayName);

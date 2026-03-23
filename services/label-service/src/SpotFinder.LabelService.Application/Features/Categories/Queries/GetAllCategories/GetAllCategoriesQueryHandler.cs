using SpotFinder.BuildingBlocks.Application;
using SpotFinder.LabelService.Domain.Repositories;

namespace SpotFinder.LabelService.Application.Features.Categories.Queries.GetAllCategories;

public sealed class GetAllCategoriesQueryHandler : IQueryHandler<GetAllCategoriesQuery, IReadOnlyList<CategoryDto>>
{
    private readonly ILabelCategoryRepository _categoryRepository;
    public GetAllCategoriesQueryHandler(ILabelCategoryRepository categoryRepository) => _categoryRepository = categoryRepository;

    public async Task<IReadOnlyList<CategoryDto>> Handle(GetAllCategoriesQuery request, CancellationToken cancellationToken)
    {
        var categories = await _categoryRepository.GetAllAsync(cancellationToken);
        return categories
            .Select(c => new CategoryDto(c.Id, c.Key, c.GetDisplayName(request.LanguageId) ?? c.Key))
            .ToList();
    }
}

using SpotFinder.BuildingBlocks.Application;
using SpotFinder.LabelService.Domain.Repositories;

namespace SpotFinder.LabelService.Application.Features.Labels.Queries.GetLabelsByCategory;

public sealed class GetLabelsByCategoryQueryHandler : IQueryHandler<GetLabelsByCategoryQuery, IReadOnlyList<LabelDto>>
{
    private readonly ILabelRepository _labelRepository;
    public GetLabelsByCategoryQueryHandler(ILabelRepository labelRepository) => _labelRepository = labelRepository;

    public async Task<IReadOnlyList<LabelDto>> Handle(GetLabelsByCategoryQuery request, CancellationToken cancellationToken)
    {
        var labels = await _labelRepository.GetByCategoryIdAsync(request.CategoryId, cancellationToken);
        return labels.Select(l => new LabelDto(l.Id, l.Key, l.GetDisplayName(request.LanguageId) ?? l.Key, l.CategoryId)).ToList();
    }
}

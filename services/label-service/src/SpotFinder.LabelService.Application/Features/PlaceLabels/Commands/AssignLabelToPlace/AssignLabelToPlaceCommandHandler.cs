using SpotFinder.BuildingBlocks.Application;
using SpotFinder.LabelService.Domain.Entities;
using SpotFinder.LabelService.Domain.Repositories;

namespace SpotFinder.LabelService.Application.Features.PlaceLabels.Commands.AssignLabelToPlace;

public sealed class AssignLabelToPlaceCommandHandler : ICommandHandler<AssignLabelToPlaceCommand>
{
    private readonly IPlaceLabelRepository _placeLabelRepository;
    private readonly IUnitOfWork _unitOfWork;

    public AssignLabelToPlaceCommandHandler(IPlaceLabelRepository placeLabelRepository, IUnitOfWork unitOfWork)
    {
        _placeLabelRepository = placeLabelRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(AssignLabelToPlaceCommand request, CancellationToken cancellationToken)
    {
        var placeLabel = PlaceLabel.Create(request.PlaceId, request.LabelId, request.Weight);
        await _placeLabelRepository.AddAsync(placeLabel, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

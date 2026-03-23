using SpotFinder.BuildingBlocks.Application;

namespace SpotFinder.LabelService.Application.Features.PlaceLabels.Commands.AssignLabelToPlace;

public sealed record AssignLabelToPlaceCommand(Guid PlaceId, int LabelId, decimal Weight = 1.0m) : ICommand;

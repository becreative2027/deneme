using SpotFinder.BuildingBlocks.Application;
using SpotFinder.PlaceService.Domain.Entities;
using SpotFinder.PlaceService.Domain.Repositories;

namespace SpotFinder.PlaceService.Application.Features.Places.Commands.CreatePlace;

public sealed class CreatePlaceCommandHandler : ICommandHandler<CreatePlaceCommand, Guid>
{
    private readonly IPlaceRepository _placeRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreatePlaceCommandHandler(IPlaceRepository placeRepository, IUnitOfWork unitOfWork)
    {
        _placeRepository = placeRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreatePlaceCommand request, CancellationToken cancellationToken)
    {
        var place = Place.Create(request.CountryId, request.CityId, request.Latitude, request.Longitude, request.Source);
        place.AddTranslation(request.LanguageId, request.Name, request.Slug);
        if (!string.IsNullOrEmpty(request.GooglePlaceId)) place.SetGooglePlaceId(request.GooglePlaceId);
        if (request.DistrictId.HasValue) place.SetDistrict(request.DistrictId.Value);
        await _placeRepository.AddAsync(place, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return place.Id;
    }
}

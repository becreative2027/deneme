using SpotFinder.BuildingBlocks.Application;
using SpotFinder.PlaceService.Domain.Repositories;

namespace SpotFinder.PlaceService.Application.Features.Places.Queries.GetPlaceById;

public sealed class GetPlaceByIdQueryHandler : IQueryHandler<GetPlaceByIdQuery, PlaceDetailDto?>
{
    private readonly IPlaceRepository _placeRepository;
    public GetPlaceByIdQueryHandler(IPlaceRepository placeRepository) => _placeRepository = placeRepository;

    public async Task<PlaceDetailDto?> Handle(GetPlaceByIdQuery request, CancellationToken cancellationToken)
    {
        var place = await _placeRepository.GetByIdAsync(request.PlaceId, cancellationToken);
        if (place is null) return null;
        var t = place.Translations.FirstOrDefault(x => x.LanguageId == request.LanguageId)
                ?? place.Translations.FirstOrDefault();
        return new PlaceDetailDto(place.Id, place.GooglePlaceId, place.CountryId, place.CityId, place.DistrictId,
            place.Latitude, place.Longitude, place.Rating, place.UserRatingsTotal, place.ParkingStatus, place.Source,
            t?.Name ?? string.Empty, t?.Slug, place.IsDeleted, place.CreatedAt);
    }
}

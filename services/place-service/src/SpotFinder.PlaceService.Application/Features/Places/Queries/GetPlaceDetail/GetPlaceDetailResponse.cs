namespace SpotFinder.PlaceService.Application.Features.Places.Queries.GetPlaceDetail;

public sealed record PlaceDetailResponse(
    Guid Id,
    string Name,
    string? Slug,
    string? GooglePlaceId,
    string? CoverImageUrl,
    int? CountryId,
    int? CityId,
    string? CityName,
    int? DistrictId,
    string? DistrictName,
    double? Latitude,
    double? Longitude,
    decimal? Rating,
    int? UserRatingsTotal,
    int ReviewCount,
    string ParkingStatus,
    string? MenuUrl,
    IReadOnlyList<string> MenuImageUrls,
    PlaceScoreDto? Score,
    IReadOnlyList<PlaceLabelDto> Labels,
    int FavoriteCount,
    int WishlistCount);

public sealed record PlaceScoreDto(
    decimal? PopularityScore,
    decimal? QualityScore,
    decimal? TrendScore,
    decimal? FinalScore);

public sealed record PlaceLabelDto(
    int LabelId,
    string Key,
    string DisplayName,
    decimal Weight);

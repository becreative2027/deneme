namespace SpotFinder.Contracts.Place;
public record PlaceDto(Guid Id, string Name, string Slug, double Latitude, double Longitude, Guid CityId, bool IsActive);

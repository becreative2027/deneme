namespace SpotFinder.SharedKernel.Primitives;
using SpotFinder.BuildingBlocks.Domain;

public sealed class Coordinate : ValueObject
{
    public double Latitude { get; }
    public double Longitude { get; }
    private Coordinate(double lat, double lon) { Latitude = lat; Longitude = lon; }
    public static Coordinate Create(double lat, double lon)
    {
        if (lat < -90 || lat > 90) throw new ArgumentOutOfRangeException(nameof(lat));
        if (lon < -180 || lon > 180) throw new ArgumentOutOfRangeException(nameof(lon));
        return new Coordinate(lat, lon);
    }
    protected override IEnumerable<object?> GetEqualityComponents() { yield return Latitude; yield return Longitude; }
}

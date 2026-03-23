namespace SpotFinder.SharedKernel.Primitives;
using SpotFinder.BuildingBlocks.Domain;
using System.Text.RegularExpressions;

public sealed class Slug : ValueObject
{
    public string Value { get; }
    private Slug(string value) { Value = value; }
    public static Slug Create(string input)
    {
        var slug = Regex.Replace(input.ToLowerInvariant().Trim(), @"[^a-z0-9\s-]", "");
        slug = Regex.Replace(slug, @"[\s-]+", "-").Trim('-');
        return new Slug(slug);
    }
    public override string ToString() => Value;
    protected override IEnumerable<object?> GetEqualityComponents() { yield return Value; }
}

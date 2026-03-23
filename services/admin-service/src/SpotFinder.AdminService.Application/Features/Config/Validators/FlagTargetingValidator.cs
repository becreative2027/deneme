using System.Text.Json;
using System.Text.RegularExpressions;

namespace SpotFinder.AdminService.Application.Features.Config.Validators;

/// <summary>
/// Phase 7.5 — Strict JSON schema validation for feature-flag targeting rules.
///
/// Allowed schema:
/// {
///   "userIds":   ["&lt;guid&gt;", ...],           // optional — exact-match list
///   "countries": ["TR", "US", ...],           // optional — ISO 3166-1 alpha-2
///   "platform":  ["ios"|"android"|"web", ...] // optional
/// }
///
/// Rules:
///   • Must be a JSON object.
///   • Only the three keys above are permitted (no unknown properties).
///   • At least one key must be present.
///   • Every element of userIds must be a parseable GUID.
///   • Every element of countries must be exactly 2 ASCII uppercase letters.
///   • Every element of platform must be one of: ios, android, web.
///   • All arrays must be non-empty if the key is present.
/// </summary>
public static class FlagTargetingValidator
{
    private static readonly HashSet<string> AllowedPlatforms =
        new(StringComparer.OrdinalIgnoreCase) { "ios", "android", "web" };

    private static readonly Regex CountryCodeRegex =
        new(@"^[A-Z]{2}$", RegexOptions.Compiled);

    /// <summary>
    /// Validates the targeting JSON string.
    /// Returns an empty list on success; one or more error strings on failure.
    /// </summary>
    public static IReadOnlyList<string> Validate(string? target)
    {
        if (string.IsNullOrWhiteSpace(target))
            return [];

        var errors = new List<string>();

        JsonDocument doc;
        try
        {
            doc = JsonDocument.Parse(target);
        }
        catch (JsonException ex)
        {
            return [$"Target is not valid JSON: {ex.Message}"];
        }

        using (doc)
        {
            var root = doc.RootElement;

            // Must be an object
            if (root.ValueKind != JsonValueKind.Object)
            {
                errors.Add("Target must be a JSON object.");
                return errors;
            }

            var knownKeys  = new HashSet<string> { "userIds", "countries", "platform" };
            var presentKeys = new HashSet<string>();

            foreach (var prop in root.EnumerateObject())
            {
                if (!knownKeys.Contains(prop.Name))
                {
                    errors.Add($"Unknown property '{prop.Name}'. Allowed: userIds, countries, platform.");
                    continue;
                }

                if (prop.Value.ValueKind != JsonValueKind.Array)
                {
                    errors.Add($"'{prop.Name}' must be an array.");
                    continue;
                }

                var elements = prop.Value.EnumerateArray().ToList();
                if (elements.Count == 0)
                {
                    errors.Add($"'{prop.Name}' must not be an empty array.");
                    continue;
                }

                presentKeys.Add(prop.Name);

                switch (prop.Name)
                {
                    case "userIds":
                        foreach (var el in elements)
                        {
                            if (el.ValueKind != JsonValueKind.String ||
                                !Guid.TryParse(el.GetString(), out _))
                                errors.Add($"userIds entry '{el}' is not a valid GUID.");
                        }
                        break;

                    case "countries":
                        foreach (var el in elements)
                        {
                            var code = el.ValueKind == JsonValueKind.String ? el.GetString() : null;
                            if (code is null || !CountryCodeRegex.IsMatch(code))
                                errors.Add($"countries entry '{el}' is not a valid ISO 3166-1 alpha-2 code (e.g. \"TR\").");
                        }
                        break;

                    case "platform":
                        foreach (var el in elements)
                        {
                            var val = el.ValueKind == JsonValueKind.String ? el.GetString() : null;
                            if (val is null || !AllowedPlatforms.Contains(val))
                                errors.Add($"platform entry '{el}' is not valid. Allowed: ios, android, web.");
                        }
                        break;
                }
            }

            if (presentKeys.Count == 0 && errors.Count == 0)
                errors.Add("Target must contain at least one of: userIds, countries, platform.");
        }

        return errors;
    }
}

# Price Priorities

When PRUNplanner calculates prices, it follows this order of preference:

- Planet Material-based
- Empire Material-based
- Planet CX-based
- Empire CX-based
- Fallback: PP30 Day Universe Price

# Preference Types

You can set preferences as BUY, SELL, or BOTH:

- **BUY** is used when the material is consumed.
- **SELL** is used when the material is produced.
- **BOTH** applies to both cases.

If only one type is set, and the calculation requires the other, PRUNplanner will check for a higher-level preference. If none exists, the value defaults to 0.

# Examples

1: The price for LST should be used. You haven’t defined a Material-based preference for Limestone. The system checks your CX preferences: first at the Planet level, then at the Empire level. Since you’ve defined both, the Planet CX preference takes priority.

2: The price for NS should be used. You’ve defined Material-based preferences for NS at both the Empire and Planet levels. The Planet Material-based preference overrides the Empire one. Because a Material-based preference exists, no CX preference is applied.

3: The price for BBH should be used. You have not set any Material-based or CX-based preferences. The price for BBH therefore is calculated with the PP30D Universe metric or falls back to 0.00 if no data is available.

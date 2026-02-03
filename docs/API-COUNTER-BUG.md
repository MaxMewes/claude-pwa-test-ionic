# API Bug: Counter vs Results Endpoint Discrepancy

## Issue Summary

The `/api/v3/results/counter` endpoint returns a different total count than the actual number of results available via `/api/v3/results` pagination.

**Example:** Counter returns `191` but paginated results only return `141` total items.

## Root Cause

For **non-MySQL databases** (MSSQL, PostgreSQL), the counter endpoint uses a different method (`GetCounter2`) that **does not filter by user's sender permissions**.

### Code Location

`labGate.Web/Controllers/Api/V3/ResultController.cs`

### Results Endpoint (Correct Behavior)

Lines 142, 181:
```csharp
var selectedSenderIds = GetSelectedSenderIdsFromFilter(senderIds, senderQuery);
int[] allowedSenderIds = User.Identity.GetSenderIds();  // Gets user's allowed senders
```

The results endpoint correctly filters by the user's accessible senders.

### Counter Endpoint (Bug)

Lines 593-598:
```csharp
var archived = area == ResultArea.Archived;
if (RuntimeEnvironment.DatabaseType != labGate.Web.Configuration.SupportedDbTypes.MySql)
{
    GetResultCounterResponse counter = GetCounter2(startDateTime, endDateTime, archived, patientIds);
    return Ok(counter);
}
```

Lines 2290-2295 (`GetCounter2` method):
```csharp
private GetResultCounterResponse GetCounter2(DateTime? startDateTime, DateTime? endDateTime, bool archived = false, int[] patientIds = null)
{
    var response = Core.Result.GetResultCounter(mask, ResultIndexMode.All, startDateTime, endDateTime, patientIds: patientIds, area: archived ? ResultListArea.Archiv : ResultListArea.Normal);
    // ...
}
```

**Problems with `GetCounter2`:**

1. **Missing sender filter** - Does not accept or use `senderIds` parameter
2. **Uses `ResultIndexMode.All`** - Bypasses user's sender restrictions
3. **Only 4 parameters** - Missing `senderIds`, `resultCategory`, `resultTypes`, `laboratoryIds`, etc.

## Impact

- Counter shows total results in the system (191)
- User can only access results from their assigned senders (141)
- Difference of 50 results are from senders the user doesn't have access to

## Affected Databases

- MSSQL
- PostgreSQL
- Any database type other than MySQL

MySQL databases use `BuildCountQuery()` which correctly applies all filters including sender restrictions.

## Recommended Fix

Update `GetCounter2` to accept and filter by `senderIds`:

```csharp
private GetResultCounterResponse GetCounter2(
    DateTime? startDateTime,
    DateTime? endDateTime,
    bool archived = false,
    int[] patientIds = null,
    int[] senderIds = null)  // Add sender filter
{
    var response = Core.Result.GetResultCounter(
        mask,
        ResultIndexMode.All,
        startDateTime,
        endDateTime,
        patientIds: patientIds,
        senderIds: senderIds,  // Pass sender filter
        area: archived ? ResultListArea.Archiv : ResultListArea.Normal);
    // ...
}
```

And update the call site (line 596):

```csharp
var selectedSenderIds = GetSelectedSenderIdsFromFilter(senderIds, senderQuery);
GetResultCounterResponse counter = GetCounter2(startDateTime, endDateTime, archived, patientIds, selectedSenderIds);
```

## Workaround (Frontend)

Until the API is fixed, the frontend pagination works correctly by detecting when the last page is incomplete:

```typescript
// If API doesn't provide TotalCount, assume more pages if last page was full
hasMore = !lastPageWasIncomplete;
```

This allows pagination to work even though the counter is incorrect.

## Date Discovered

2026-02-03

## Status

**Open** - API fix required in labGate backend

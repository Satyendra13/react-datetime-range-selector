# React DateTime Range Selector

A flexible and feature-rich date and time selector component for React with Bootstrap 5 support.

## Installation

```bash
npm install react-datetime-range-selector
```

## Features

- Single date selection
- Date and time selection
- Time-only selection
- Date range selection
- Multiple date/time formats (moment.js compatible)
- Disable future dates/times
- Disable present dates/times
- Disable specific dates/times
- Quick selectors (Today, Last 7 days, Last 30 days, This week, This month)
- Bootstrap 5 styling support
- Custom styling support

## Usage

```javascript
import React, { useState } from 'react';
import DateTimeSelector from 'react-datetime-range-selector';

function App() {
  const [date, setDate] = useState(null);

  return (
    <DateTimeSelector
      mode="single"
      value={date}
      onChange={setDate}
      format="YYYY-MM-DD"
      placeholder="Select a date"
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| mode | string | 'single' | Selection mode: 'single', 'datetime', 'time', 'range' |
| value | string/array | null | Selected value(s) |
| onChange | function | - | Callback when value changes |
| format | string | 'YYYY-MM-DD' | Date format (moment.js) |
| timeFormat | string | 'HH:mm' | Time format (moment.js) |
| disableFuture | boolean | false | Disable future dates |
| disablePresent | boolean | false | Disable present date |
| disabledDates | array | [] | Array of disabled dates |
| disabledTimes | array | [] | Array of disabled times (HH:mm format) |
| showQuickSelect | boolean | false | Show quick select buttons |
| useBootstrap | boolean | true | Use Bootstrap 5 styling |
| customClassName | string | '' | Additional CSS classes |
| placeholder | string | 'Select date' | Input placeholder |
| minDate | string | null | Minimum selectable date |
| maxDate | string | null | Maximum selectable date |

## Examples

### Single Date Selector
```javascript
<DateTimeSelector
  mode="single"
  value={date}
  onChange={setDate}
  format="DD/MM/YYYY"
/>
```

### Date Range Selector with Quick Select
```javascript
<DateTimeSelector
  mode="range"
  value={dateRange}
  onChange={setDateRange}
  showQuickSelect={true}
  disableFuture={true}
/>
```

### DateTime Selector
```javascript
<DateTimeSelector
  mode="datetime"
  value={datetime}
  onChange={setDatetime}
  format="YYYY-MM-DD"
  timeFormat="HH:mm:ss"
/>
```

### Time Only Selector
```javascript
<DateTimeSelector
  mode="time"
  value={time}
  onChange={setTime}
  timeFormat="hh:mm A"
/>
```

### With Disabled Dates
```javascript
<DateTimeSelector
  mode="single"
  value={date}
  onChange={setDate}
  disabledDates={['2025-10-20', '2025-10-25']}
  disableFuture={true}
/>
```

## License

MIT
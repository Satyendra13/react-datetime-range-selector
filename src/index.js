import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import './styles.css';

const DateTimeSelector = ({
    mode = 'single', // 'single', 'datetime', 'time', 'range'
    value = null,
    onChange,
    format = 'YYYY-MM-DD',
    timeFormat = 'HH:mm',
    disableFuture = false,
    disablePresent = false,
    disabledDates = [],
    disabledTimes = [],
    showQuickSelect = false,
    useBootstrap = true,
    customClassName = '',
    placeholder = 'Select date',
    minDate = null,
    maxDate = null
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(moment());
    const [selectedDate, setSelectedDate] = useState(value ? moment(value) : null);
    const [rangeStart, setRangeStart] = useState(null);
    const [rangeEnd, setRangeEnd] = useState(null);
    const [selectedTime, setSelectedTime] = useState(
        mode === 'time' && value ? moment(value, timeFormat) : moment()
    );
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (value) {
            if (mode === 'range' && Array.isArray(value)) {
                setRangeStart(value[0] ? moment(value[0]) : null);
                setRangeEnd(value[1] ? moment(value[1]) : null);
            } else if (mode === 'time') {
                setSelectedTime(moment(value, timeFormat));
            } else {
                setSelectedDate(moment(value));
            }
        }
    }, [value, mode, timeFormat]);

    const isDateDisabled = (date) => {
        const today = moment().startOf('day');
        const checkDate = moment(date).startOf('day');

        if (disableFuture && checkDate.isAfter(today)) return true;
        if (disablePresent && checkDate.isSame(today)) return true;
        if (minDate && checkDate.isBefore(moment(minDate).startOf('day'))) return true;
        if (maxDate && checkDate.isAfter(moment(maxDate).startOf('day'))) return true;

        return disabledDates.some(d =>
            moment(d).startOf('day').isSame(checkDate)
        );
    };

    const isTimeDisabled = (hour, minute) => {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        return disabledTimes.includes(timeStr);
    };

    const handleQuickSelect = (type) => {
        const today = moment();
        let start, end;

        switch (type) {
            case 'today':
                start = end = today.clone();
                break;
            case 'last7days':
                start = today.clone().subtract(7, 'days');
                end = today.clone();
                break;
            case 'last30days':
                start = today.clone().subtract(30, 'days');
                end = today.clone();
                break;
            case 'thisWeek':
                start = today.clone().startOf('week');
                end = today.clone().endOf('week');
                break;
            case 'thisMonth':
                start = today.clone().startOf('month');
                end = today.clone().endOf('month');
                break;
            default:
                return;
        }

        if (mode === 'range') {
            setRangeStart(start);
            setRangeEnd(end);
            if (onChange) {
                onChange([start.format(format), end.format(format)]);
            }
        } else {
            setSelectedDate(start);
            if (onChange) {
                onChange(start.format(format));
            }
        }
        setIsOpen(false);
    };

    const handleDateClick = (date) => {
        if (isDateDisabled(date)) return;

        if (mode === 'range') {
            if (!rangeStart || (rangeStart && rangeEnd)) {
                setRangeStart(moment(date));
                setRangeEnd(null);
            } else {
                const end = moment(date);
                if (end.isBefore(rangeStart)) {
                    setRangeEnd(rangeStart);
                    setRangeStart(end);
                } else {
                    setRangeEnd(end);
                }
                if (onChange) {
                    const start = end.isBefore(rangeStart) ? end : rangeStart;
                    const endDate = end.isBefore(rangeStart) ? rangeStart : end;
                    onChange([start.format(format), endDate.format(format)]);
                }
                setIsOpen(false);
            }
        } else {
            setSelectedDate(moment(date));
            if (mode === 'single') {
                if (onChange) {
                    onChange(moment(date).format(format));
                }
                setIsOpen(false);
            }
        }
    };

    const handleTimeChange = (type, value) => {
        const newTime = selectedTime.clone();
        if (type === 'hour') {
            newTime.hour(parseInt(value));
        } else {
            newTime.minute(parseInt(value));
        }
        setSelectedTime(newTime);
    };

    const handleDateTimeConfirm = () => {
        if (mode === 'datetime' && selectedDate) {
            const combined = selectedDate.clone()
                .hour(selectedTime.hour())
                .minute(selectedTime.minute());
            if (onChange) {
                onChange(combined.format(`${format} ${timeFormat}`));
            }
            setIsOpen(false);
        } else if (mode === 'time') {
            if (onChange) {
                onChange(selectedTime.format(timeFormat));
            }
            setIsOpen(false);
        }
    };

    const renderCalendar = () => {
        const startOfMonth = currentMonth.clone().startOf('month');
        const endOfMonth = currentMonth.clone().endOf('month');
        const startDate = startOfMonth.clone().startOf('week');
        const endDate = endOfMonth.clone().endOf('week');

        const calendar = [];
        const day = startDate.clone();

        while (day.isBefore(endDate, 'day')) {
            const week = [];
            for (let i = 0; i < 7; i++) {
                const currentDay = day.clone();
                const isCurrentMonth = currentDay.month() === currentMonth.month();
                const isDisabled = isDateDisabled(currentDay);
                const isSelected = selectedDate && currentDay.isSame(selectedDate, 'day');
                const isInRange = mode === 'range' && rangeStart && rangeEnd &&
                    currentDay.isBetween(rangeStart, rangeEnd, 'day', '[]');
                const isRangeStart = mode === 'range' && rangeStart && currentDay.isSame(rangeStart, 'day');
                const isRangeEnd = mode === 'range' && rangeEnd && currentDay.isSame(rangeEnd, 'day');

                week.push(
                    <div
                        key={currentDay.format('YYYY-MM-DD')}
                        className={`
              dts-day
              ${!isCurrentMonth ? 'dts-day-other-month' : ''}
              ${isDisabled ? 'dts-day-disabled' : ''}
              ${isSelected ? 'dts-day-selected' : ''}
              ${isInRange ? 'dts-day-in-range' : ''}
              ${isRangeStart ? 'dts-day-range-start' : ''}
              ${isRangeEnd ? 'dts-day-range-end' : ''}
              ${useBootstrap && isSelected ? 'bg-primary text-white' : ''}
              ${useBootstrap && isInRange && !isSelected ? 'bg-primary bg-opacity-25' : ''}
            `}
                        onClick={() => handleDateClick(currentDay)}
                    >
                        {currentDay.date()}
                    </div>
                );
                day.add(1, 'day');
            }
            calendar.push(<div key={day.format('YYYY-MM-DD')} className="dts-week">{week}</div>);
        }

        return calendar;
    };

    const renderTimePicker = () => {
        const hours = Array.from({ length: 24 }, (_, i) => i);
        const minutes = Array.from({ length: 60 }, (_, i) => i);

        return (
            <div className="dts-time-picker">
                <div className="dts-time-column">
                    <div className="dts-time-label">Hour</div>
                    <div className="dts-time-list">
                        {hours.map(hour => (
                            <div
                                key={hour}
                                className={`
                  dts-time-item
                  ${selectedTime.hour() === hour ? 'dts-time-selected' : ''}
                  ${useBootstrap && selectedTime.hour() === hour ? 'bg-primary text-white' : ''}
                `}
                                onClick={() => handleTimeChange('hour', hour)}
                            >
                                {hour.toString().padStart(2, '0')}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="dts-time-column">
                    <div className="dts-time-label">Minute</div>
                    <div className="dts-time-list">
                        {minutes.map(minute => (
                            <div
                                key={minute}
                                className={`
                  dts-time-item
                  ${selectedTime.minute() === minute ? 'dts-time-selected' : ''}
                  ${useBootstrap && selectedTime.minute() === minute ? 'bg-primary text-white' : ''}
                `}
                                onClick={() => handleTimeChange('minute', minute)}
                            >
                                {minute.toString().padStart(2, '0')}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const getDisplayValue = () => {
        if (mode === 'range') {
            if (rangeStart && rangeEnd) {
                return `${rangeStart.format(format)} - ${rangeEnd.format(format)}`;
            }
            return placeholder;
        } else if (mode === 'datetime' && selectedDate) {
            return selectedDate.format(`${format} ${timeFormat}`);
        } else if (mode === 'time') {
            return selectedTime.format(timeFormat);
        } else if (selectedDate) {
            return selectedDate.format(format);
        }
        return placeholder;
    };

    const baseClassName = useBootstrap ? 'form-control' : 'dts-input';

    return (
        <div
            className={`dts-container ${customClassName}`}
            ref={containerRef}
        >
            <input
                type="text"
                className={baseClassName}
                value={getDisplayValue()}
                onClick={() => setIsOpen(!isOpen)}
                readOnly
                placeholder={placeholder}
            />

            {isOpen && (
                <div className={`dts-dropdown ${useBootstrap ? 'shadow border' : ''}`}>
                    {showQuickSelect && mode === 'range' && (
                        <div className="dts-quick-select">
                            <button
                                className={useBootstrap ? 'btn btn-sm btn-outline-primary' : 'dts-quick-btn'}
                                onClick={() => handleQuickSelect('today')}
                            >
                                Today
                            </button>
                            <button
                                className={useBootstrap ? 'btn btn-sm btn-outline-primary' : 'dts-quick-btn'}
                                onClick={() => handleQuickSelect('last7days')}
                            >
                                Last 7 Days
                            </button>
                            <button
                                className={useBootstrap ? 'btn btn-sm btn-outline-primary' : 'dts-quick-btn'}
                                onClick={() => handleQuickSelect('last30days')}
                            >
                                Last 30 Days
                            </button>
                            <button
                                className={useBootstrap ? 'btn btn-sm btn-outline-primary' : 'dts-quick-btn'}
                                onClick={() => handleQuickSelect('thisWeek')}
                            >
                                This Week
                            </button>
                            <button
                                className={useBootstrap ? 'btn btn-sm btn-outline-primary' : 'dts-quick-btn'}
                                onClick={() => handleQuickSelect('thisMonth')}
                            >
                                This Month
                            </button>
                        </div>
                    )}

                    {mode !== 'time' && (
                        <>
                            <div className="dts-header">
                                <button
                                    className={useBootstrap ? 'btn btn-sm' : 'dts-nav-btn'}
                                    onClick={() => setCurrentMonth(currentMonth.clone().subtract(1, 'month'))}
                                >
                                    ‹
                                </button>
                                <span className="dts-month-year">
                                    {currentMonth.format('MMMM YYYY')}
                                </span>
                                <button
                                    className={useBootstrap ? 'btn btn-sm' : 'dts-nav-btn'}
                                    onClick={() => setCurrentMonth(currentMonth.clone().add(1, 'month'))}
                                >
                                    ›
                                </button>
                            </div>

                            <div className="dts-weekdays">
                                {moment.weekdaysShort().map(day => (
                                    <div key={day} className="dts-weekday">{day}</div>
                                ))}
                            </div>

                            <div className="dts-calendar">
                                {renderCalendar()}
                            </div>
                        </>
                    )}

                    {(mode === 'datetime' || mode === 'time') && (
                        <>
                            {renderTimePicker()}
                            <div className="dts-actions">
                                <button
                                    className={useBootstrap ? 'btn btn-primary btn-sm' : 'dts-confirm-btn'}
                                    onClick={handleDateTimeConfirm}
                                >
                                    Confirm
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default DateTimeSelector;
"use client";
  
import React from 'react';
import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableRow, Paper } from '@mui/material';

import useTime from '@/hooks/useTime';

import { format } from 'date-fns';

type TimeProps = {
    tweetId: number;
    handle?: string;
    begintime: string;
    endtime: string;
    timeCount: Array<{ day: string; hour: number; count: number; }>;    
    selectedTime: Array<{ day: string; hour: number; }>;
    click: boolean;
  };

export default function TimeSelector({
    tweetId,handle,begintime,endtime,timeCount,selectedTime,click
}: TimeProps) {
  const { selectTime, unselectTime } = useTime();
  const startDate = new Date(begintime);
  const endDate = new Date(endtime);
  const [clicked, setClicked] = useState(click);
  const [selectedCells, setSelectedCells] = useState<{ day: string; hour: number }[]>(selectedTime);
  const [hoveredCells, setHoveredCells] = useState<{ day: string; hour: number }[]>([]);

  useEffect(() => {
    setClicked(click);
  }, [click]);

  function generateColor(timeCount: Array<{ day: string; hour: number; count: number;}>) {
    const r = 255; // 设置基准色调，可以调整
    const g = 189; // 设置饱和度，可以调整
    const b = 0

    const colorMap: { [key: string]: { [key: number]: string } } = {};

    timeCount.map((time) => {
      const color = `rgba(${r}, ${g}, ${b}, ${time.count/6})`;

          // 使用对象存储颜色，以日期和小时作为键
      if (!colorMap[time.day]) {
        colorMap[time.day] = {};
      }
      colorMap[time.day][time.hour] = color;
    })
    return colorMap;
  }

  const colorMap = generateColor(timeCount);
  

  function getDatesBetween(startDate: Date, endDate: Date) {
    const dates = [];
    const currentDate = new Date(startDate);
    
    while (format(currentDate, 'yyyy-MM-dd') <= format(endDate, 'yyyy-MM-dd')) {
      dates.push(format(currentDate, 'yyyy-MM-dd'));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  }


  const datesBetween = getDatesBetween(startDate, endDate);
  const hoursOfDay = Array.from({ length: 24 }, (_, index) => index);

  const isCellClickable = (day: string, hour: number) => {
    const startday = format(startDate, 'yyyy-MM-dd');
    const endday = format(endDate, 'yyyy-MM-dd');
    const startHour = startDate.getHours();
    const endHour = endDate.getHours();
    
    return !(day === startday && hour < startHour) && !(day === endday && hour >= endHour);
  };

  const handleCellClick = async (day: string, hour: number) => {
    if (isCellClickable(day, hour) && handle && clicked) {
      const isSelected = selectedCells.some(cell => cell.day === day && cell.hour === hour);

      if (isSelected) {
        const updatedSelection = selectedCells.filter(cell => !(cell.day === day && cell.hour === hour));
        setSelectedCells(updatedSelection);
        try {
          await unselectTime({
            tweetId,
            userHandle:handle,
            day,
            hour,
          });
        } catch (e) {
          console.error('Error:', e);
          alert("Error unselecting time");
        }

      } else {
        setSelectedCells([...selectedCells, { day, hour }]);
        try {
          await selectTime({
            tweetId,
            userHandle:handle,
            day,
            hour,
          });
        } catch (e) {
          console.error('Error:', e);
          alert("Error selecting time");
        }
      }

    }
  };

  const handleMouseOver = () => {
    setHoveredCells(selectedCells);
  };

  const handleMouseOut = () => {
    setHoveredCells([]);
  };

  const buttomcells = Array.from({ length: 7 }, (_, index) => (
    <td key={index} style={{ backgroundColor: `rgba(255,189, 0, ${index/6})`}} className='border border-gray-300 h-10'></td>
  ));
  buttomcells.unshift(<td key={"left"} className='pl-5 h-10 w-20'>0/6</td>);
  buttomcells.push(<td key={"right"} className='pr-5 h-10 w-20 text-end'>6/6</td>);

  return (
    <Paper>
      <Table                 
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}>
        <TableBody onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}>
          {/* 表頭 */}
          <TableRow>
            <TableCell></TableCell>
            {datesBetween.map(day => (
              <TableCell key={day}>{day}</TableCell>
            ))}
          </TableRow>

          {/* 內容 */}
          {hoursOfDay.map(hour => (
            <TableRow key={hour}>
              <TableCell className='border-r border-b'>{hour}:00</TableCell>
              {datesBetween.map(day => (
                <TableCell 
                key={`${day}-${hour}`} 
                style={{ backgroundColor: colorMap[day]?.[hour] || '' }}
                className={`border border-gray-300 cursor-pointer hover:bg-yellow-200
                ${isCellClickable(day, hour)
                    ? ''
                    : 'bg-gray-500 cursor-not-allowed'} 
                ${hoveredCells.some(cell => cell.day === day && cell.hour === hour) && click ? 'border-red-600 border-4':""}`}
                onClick={() => handleCellClick(day, hour)}>
                </TableCell>
                ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Table className='mt-5'>
        <TableBody>
          <TableRow>{buttomcells}</TableRow>
        </TableBody>
      </Table>
    </Paper>
  );
};


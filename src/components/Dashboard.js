import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { useDemoRouter } from '@toolpad/core/internal';
import { createTheme } from '@mui/material/styles';
import { useDrag, useDrop } from 'react-dnd';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Card from './Card';

const demoTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-kanbanpro-color-scheme',
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

const ItemType = 'TASK';

function Dashboard(props) {
  const { window } = props;
  const router = useDemoRouter('/');

  // Load columns data from localStorage
  const loadColumnsFromLocalStorage = () => {
    const savedData = localStorage.getItem('kanban-columns');
    return savedData ? JSON.parse(savedData) : {
      todo: { name: 'ToDo', tasks: [] },
      inprogress: { name: 'InProgress', tasks: [] },
      complete: { name: 'Complete', tasks: [] },
    };
  };

  const [columns, setColumns] = useState(loadColumnsFromLocalStorage);

  // Task content for each column
  const [taskContent, setTaskContent] = useState({
    todo: '',
    inprogress: '',
    complete: ''
  });

  const [isInputVisible, setIsInputVisible] = useState({});

  // Save columns data to localStorage whenever columns are updated
  useEffect(() => {
    localStorage.setItem('kanban-columns', JSON.stringify(columns));
  }, [columns]);

  const addTask = (columnKey) => {
    if (taskContent[columnKey].trim()) {
      setColumns((prevColumns) => {
        const updatedColumns = { ...prevColumns };
        updatedColumns[columnKey].tasks.push({
          id: `task-${Date.now()}`, // Unique task ID
          content: taskContent[columnKey],
        });

        return updatedColumns;
      });
      setTaskContent((prevContent) => ({ ...prevContent, [columnKey]: '' }));
      setIsInputVisible((prev) => ({ ...prev, [columnKey]: false }));

      // Show success toast when a task is added
      toast.success('Task added successfully!');
    }
  };

  const toggleInputVisibility = (columnKey) => {
    setIsInputVisible((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  const moveTask = (sourceColumnKey, destColumnKey, taskId, index) => {
    if (sourceColumnKey === destColumnKey) return; // Don't move if columns are the same

    const sourceColumn = columns[sourceColumnKey];
    const destColumn = columns[destColumnKey];
    const sourceTasks = Array.from(sourceColumn.tasks);
    const destTasks = Array.from(destColumn.tasks);

    // Find and remove the task from source
    const taskToMove = sourceTasks.find((task) => task.id === taskId);
    if (taskToMove) {
      sourceTasks.splice(sourceTasks.indexOf(taskToMove), 1);
      destTasks.splice(index, 0, taskToMove); // Add task to the new column at the specified index

      setColumns((prevColumns) => ({
        ...prevColumns,
        [sourceColumnKey]: { ...sourceColumn, tasks: sourceTasks },
        [destColumnKey]: { ...destColumn, tasks: destTasks },
      }));

      // Show success toast when a task is moved
      // toast.info('Task moved successfully!');
    }
  };

  return (
    <AppProvider
      branding={{
        logo: <img src="kanban-removebg-preview.png" alt="KanbanPro logo" />,
        title: 'KanbanPro',
      }}
      router={router}
      theme={demoTheme}
      window={window ? window() : undefined}
    >
      <DndProvider backend={HTML5Backend}>
        <DashboardLayout hideNavigation>
          <div className="flex flex-wrap items-center justify-center gap-10">
            {Object.keys(columns).map((columnKey) => (
              <Column
                key={columnKey}
                columnKey={columnKey}
                column={columns[columnKey]}
                moveTask={moveTask}
                isInputVisible={isInputVisible}
                toggleInputVisibility={toggleInputVisibility}
                addTask={addTask}
                taskContent={taskContent[columnKey]}
                setTaskContent={(content) =>
                  setTaskContent((prevContent) => ({
                    ...prevContent,
                    [columnKey]: content,
                  }))
                }
              />
            ))}
          </div>
        </DashboardLayout>
      </DndProvider>
      <ToastContainer   /> {/* Toast Container for the notifications */}
    </AppProvider>
  );
}

const Column = ({
  columnKey,
  column,
  moveTask,
  isInputVisible,
  toggleInputVisibility,
  addTask,
  taskContent,
  setTaskContent,
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: ItemType,
    drop: (item) => {
      moveTask(item.columnKey, columnKey, item.taskId, column.tasks.length); // Add to the end of the column
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`w-80 relative p-3 ${isOver ? '' : ''}`}
    >
      <Card
        status={columnKey}
        content={
          <div className="space-y-2 min-h-[100px] p-2 rounded-md">
            {column.tasks.map((task, index) => (
              <Task key={task.id} task={task} columnKey={columnKey} index={index} moveTask={moveTask} />
            ))}
          </div>
        }
        onClickPlus={() => toggleInputVisibility(columnKey)}
      />

      {isInputVisible[columnKey] && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 ml-12">
            <h2 className="text-lg font-semibold mb-4 text-center">Add New Task</h2>
            <input
              type="text"
              value={taskContent}
              onChange={(e) => setTaskContent(e.target.value)}
              placeholder="Enter task"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mb-3"
            />
            <div className="flex justify-between">
              <button
                onClick={() => addTask(columnKey)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md shadow hover:bg-blue-600 transition-all"
              >
                Add Task
              </button>
              <button
                onClick={() => {
                  setTaskContent('');
                  toggleInputVisibility(columnKey);
                }}
                className="text-red-500 px-4 py-2 hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Task = ({ task, columnKey, index, moveTask }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { taskId: task.id, columnKey, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={`p-3 rounded-md shadow border transition-all ${isDragging ? 'opacity-0 bg-transparent' : 'bg-white'}`}
    >
      {task.content}
    </div>
  );
};

Dashboard.propTypes = {
  window: PropTypes.func,
};

export default Dashboard;

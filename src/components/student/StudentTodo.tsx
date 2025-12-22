import { TodoList } from '../ui/TodoList';
import { useTodos } from '../../hooks/useTodos';
import { Card, CardContent } from '../ui/Card';

interface StudentTodoProps {
  userId: string;
  className?: string;
}

export const StudentTodo: React.FC<StudentTodoProps> = ({ userId, className = '' }) => {
  const { todos, loading, pagination, goToPage, setPageSize, addTodo, updateTodo, deleteTodo } =
    useTodos(userId);

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardContent className="p-0">
          <TodoList
            todos={todos}
            loading={loading}
            pagination={pagination}
            goToPage={goToPage}
            setPageSize={setPageSize}
            onAdd={addTodo}
            onUpdate={updateTodo}
            onDelete={deleteTodo}
            userId={userId}
            showAddButton={true}
            maxHeight="400px"
          />
        </CardContent>
      </Card>
    </div>
  );
};

import { client } from "../services/APIService";
import {
  Task,
  AddTask,
  DeleteTask,
  MoveTask,
  Column,
} from "../features/Project/types";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useColumns(projectId: string) {
  return useQuery<Column[], Error>(["project", projectId, "columns"], () => {
    return client.get(`/projects/${projectId}/columns`);
  });
}
export function useTasks(projectId: string) {
  return useQuery<Task[], Error>(["project", projectId, "tasks"], () => {
    return client.get(`/projects/${projectId}/tasks`);
  });
}

export function useAddTask() {
  const queryClient = useQueryClient();

  const { mutate } = useMutation<Task, Error, AddTask>(
    ({ projectId, columnId, task }) =>
      client.post(`/projects/${projectId}/columns/${columnId}/tasks`, {
        title: task,
      }),
    {
      onSuccess: (data, variables) => {
        queryClient.setQueryData<Task[]>(
          ["project", variables.projectId, "tasks"],
          (prev = []) => [...prev, data]
        );

        queryClient.setQueryData(
          ["project", variables.projectId, "columns"],
          (prev) => {
            let state = prev as Column[];

            const column = (state || []).find((item) => {
              return item.columnName === "column-1";
            });

            if (column) {
              return [
                ...state,
                { ...column, taskIds: [...column.taskIds, data.id] },
              ];
            }

            return state;
          }
        );
      },
    }
  );
  return [mutate];
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  const { mutate } = useMutation<Task, Error, Task>(
    (task) =>
      client.patch(`/projects/tasks/${task.id}`, {
        title: task.title,
        content: task.content,
        assignedTo: task.assignedTo,
        attachments: task.attachments,
        comments: task.comments,
      }),
    {
      onSuccess: (data, variables) => {
        queryClient.setQueryData<Task[]>(
          ["project", variables.projectId, "tasks"],
          (prev = []) => [...prev, data]
        );
      },
    }
  );
  return [mutate];
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  const { mutate } = useMutation<Task, Error, DeleteTask>(
    ({ columnId, taskId }) =>
      client.delete(`/projects/columns/${columnId}/tasks/${taskId}`),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries([
          "projects",
          variables.projectId,
          "tasks",
        ]);
      },
    }
  );
  return [mutate];
}

export function useMoveTask() {
  const { mutate } = useMutation<Task, Error, MoveTask>(
    ({ to, from, taskId, taskIds }) =>
      client.patch(`/projects/tasks/${taskId}/move`, {
        to,
        from,
        taskIds,
      })
  );
  return [mutate];
}
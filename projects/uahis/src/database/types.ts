// Things database types
export interface Task {
  id: string;
  uuid: string;
  title: string;
  notes?: string;
  dueDate?: number; // Unix timestamp
  createdDate?: number;
  modifiedDate?: number;
  index: number;
  list: 'today' | 'upcoming' | 'anytime' | 'someday' | 'logbook';
  status: number; // 0 = active, 2 = completed, 3 = cancelled
  area?: string;
  project?: string;
  tags?: string[];
  repeating?: boolean;
  repeatRule?: string;
}

export interface Tag {
  id: string;
  uuid?: string;
  title: string;
  color?: string;
  shortcut?: string;
  parent?: string;
  index?: number;
}

export interface TaskWithTags extends Task {
  tagsForTask: Tag[];
}

export interface Area {
  id: string;
  uuid: string;
  title: string;
  color?: string;
  index: number;
}

export interface TaskTag {
  task: string;
  tag: string;
}

export interface DatabaseConnection {
  ready: boolean;
  error?: string;
}

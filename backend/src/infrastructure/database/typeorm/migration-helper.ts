import { TableColumn, TableForeignKey } from 'typeorm';

export function uuidCol(name: string, options: Partial<TableColumn> = {}): TableColumn {
  return new TableColumn({
    name,
    type: 'uuid',
    isNullable: false,
    ...options,
  });
}

export function uuidPrimaryCol(name = 'id'): TableColumn {
  return new TableColumn({
    name,
    type: 'uuid',
    isPrimary: true,
    isGenerated: true,
    generationStrategy: 'uuid',
  });
}

export function varcharCol(name: string, length = '255', options: Partial<TableColumn> = {}): TableColumn {
  return new TableColumn({
    name,
    type: 'character varying',
    length,
    isNullable: false,
    ...options,
  });
}

export function textCol(name: string, options: Partial<TableColumn> = {}): TableColumn {
  return new TableColumn({
    name,
    type: 'text',
    isNullable: false,
    ...options,
  });
}

export function intCol(name: string, options: Partial<TableColumn> = {}): TableColumn {
  return new TableColumn({
    name,
    type: 'integer',
    isNullable: false,
    default: 0,
    ...options,
  });
}

export function boolCol(name: string, defaultValue = false, options: Partial<TableColumn> = {}): TableColumn {
  return new TableColumn({
    name,
    type: 'boolean',
    isNullable: false,
    default: defaultValue,
    ...options,
  });
}

export function enumCol(
  name: string,
  enumValues: string[],
  defaultValue?: string,
  options: Partial<TableColumn> = {},
): TableColumn {
  return new TableColumn({
    name,
    type: 'enum',
    enum: enumValues,
    isNullable: false,
    default: defaultValue ? `'${defaultValue}'` : undefined,
    ...options,
  });
}

export function jsonbCol(name: string, options: Partial<TableColumn> = {}): TableColumn {
  return new TableColumn({
    name,
    type: 'jsonb',
    isNullable: true,
    ...options,
  });
}

export function timestamptzCol(name: string, options: Partial<TableColumn> = {}): TableColumn {
  return new TableColumn({
    name,
    type: 'timestamptz',
    isNullable: false,
    ...options,
  });
}

export function createdAtCol(): TableColumn {
  return new TableColumn({
    name: 'created_at',
    type: 'timestamptz',
    isNullable: false,
    default: 'now()',
  });
}

export function updatedAtCol(): TableColumn {
  return new TableColumn({
    name: 'updated_at',
    type: 'timestamptz',
    isNullable: false,
    default: 'now()',
  });
}

export function fkConstraint(
  columnNames: string[],
  referencedTableName: string,
  referencedColumnNames: string[],
  onDelete: 'CASCADE' | 'SET NULL' | 'RESTRICT' = 'CASCADE',
): TableForeignKey {
  return new TableForeignKey({
    columnNames,
    referencedTableName,
    referencedColumnNames,
    onDelete,
  });
}

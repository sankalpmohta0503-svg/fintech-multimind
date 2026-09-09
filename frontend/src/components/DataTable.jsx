import React from 'react';

const DataTable = ({ columns, rows, getRowKey, emptyMessage = 'No records available.', className = '' }) => (
  <div className={`overflow-x-auto rounded border border-slate-200 ${className}`}>
    <table className="data-table"><thead><tr>{columns.map((column) => <th key={column.key} scope="col" className={column.align === 'right' ? 'text-right' : ''}>{column.label}</th>)}</tr></thead><tbody>
      {rows.length ? rows.map((row, rowIndex) => <tr key={getRowKey ? getRowKey(row, rowIndex) : rowIndex}>{columns.map((column) => <td key={column.key} className={column.align === 'right' ? 'text-right tabular-nums' : ''}>{column.render ? column.render(row, rowIndex) : row[column.key]}</td>)}</tr>) : <tr><td colSpan={columns.length} className="py-8 text-center text-slate-500">{emptyMessage}</td></tr>}
    </tbody></table>
  </div>
);

export default DataTable;

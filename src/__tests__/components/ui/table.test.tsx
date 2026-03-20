import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import * as React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '@/components/ui/table';

describe('Table Components', () => {
    it('Table should_render_correctly_with_custom_class', () => {
        const { container } = render(<Table className="custom-table" />);
        const table = container.querySelector('table');
        expect(table).toBeInTheDocument();
        expect(table).toHaveClass('custom-table', 'w-full', 'caption-bottom', 'text-sm');
    });

    it('TableHeader should_render_correctly', () => {
        const { container } = render(
            <Table>
                <TableHeader className="custom-header">
                    <tr><th>Header</th></tr>
                </TableHeader>
            </Table>
        );
        const thead = container.querySelector('thead');
        expect(thead).toBeInTheDocument();
        expect(thead).toHaveClass('custom-header');
    });

    it('TableBody should_render_correctly', () => {
        const { container } = render(
            <Table>
                <TableBody className="custom-body">
                    <tr><td>Body</td></tr>
                </TableBody>
            </Table>
        );
        const tbody = container.querySelector('tbody');
        expect(tbody).toBeInTheDocument();
        expect(tbody).toHaveClass('custom-body');
    });

    it('TableFooter should_render_correctly', () => {
        const { container } = render(
            <Table>
                <TableFooter className="custom-footer">
                    <tr><td>Footer</td></tr>
                </TableFooter>
            </Table>
        );
        const tfoot = container.querySelector('tfoot');
        expect(tfoot).toBeInTheDocument();
        expect(tfoot).toHaveClass('custom-footer');
    });

    it('TableRow should_render_correctly', () => {
        const { container } = render(
            <Table>
                <TableBody>
                    <TableRow className="custom-row">
                        <td>Row</td>
                    </TableRow>
                </TableBody>
            </Table>
        );
        const tr = container.querySelector('tr');
        expect(tr).toBeInTheDocument();
        expect(tr).toHaveClass('custom-row');
    });

    it('TableHead should_render_correctly', () => {
        const { container } = render(
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="custom-head">Head</TableHead>
                    </TableRow>
                </TableHeader>
            </Table>
        );
        const th = container.querySelector('th');
        expect(th).toBeInTheDocument();
        expect(th).toHaveClass('custom-head', 'h-10');
    });

    it('TableCell should_render_correctly', () => {
        const { container } = render(
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell className="custom-cell">Cell</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        );
        const td = container.querySelector('td');
        expect(td).toBeInTheDocument();
        expect(td).toHaveClass('custom-cell', 'p-2');
    });

    it('TableCaption should_render_correctly', () => {
        const { container } = render(
            <Table>
                <TableCaption className="custom-caption">Caption</TableCaption>
            </Table>
        );
        const caption = container.querySelector('caption');
        expect(caption).toBeInTheDocument();
        expect(caption).toHaveClass('custom-caption', 'mt-4');
    });

    it('should_forward_refs_correctly', () => {
        const tableRef = React.createRef<HTMLTableElement>();
        render(<Table ref={tableRef} />);
        expect(tableRef.current).toBeInstanceOf(HTMLTableElement);
    });
});

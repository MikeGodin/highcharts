/* *
 *
 *  Data Grid class
 *
 *  (c) 2020-2024 Highsoft AS
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 *  Authors:
 *  - Dawid Dragula
 *  - Sebastian Bochan
 *
 * */

'use strict';

/* *
 *
 *  Imports
 *
 * */

import type Cell from './Cell';
import type Column from './Column';

import Table from './Table.js';
import DGUtils from './Utils.js';

const { makeHTMLElement } = DGUtils;

/* *
 *
 *  Abstract Class of Row
 *
 * */

/**
 * Represents a row in the data grid.
 */
abstract class Row {

    /* *
    *
    *  Properties
    *
    * */

    /**
     * The cells of the row.
     */
    public cells: Cell[] = [];

    /**
     * The HTML element of the row.
     */
    public htmlElement: HTMLTableRowElement;

    /**
     * The viewport the row belongs to.
     */
    public viewport: Table;

    /**
     * The index of the row in the data table.
     */
    public index: number;

    /**
     * Flag to determine if the row is being destroyed.
     */
    private destroyed?: boolean;

    /* *
    *
    *  Constructor
    *
    * */

    /**
     * Constructs a row in the data grid.
     *
     * @param viewport
     * The Data Grid Table instance which the row belongs to.
     *
     * @param index
     * The index of rendered row
     */
    constructor(viewport: Table, index: number) {
        this.viewport = viewport;
        this.index = index;
        this.htmlElement = makeHTMLElement('tr', {});
        this.setRowAttributes();
    }


    /* *
    *
    *  Methods
    *
    * */

    /**
     * Creates a cell in the row.
     *
     * @param column
     * The column the cell belongs to.
     */
    public abstract createCell(column: Column): Cell;

    /**
     * Renders the row's content. It does not attach the row element to the
     * viewport nor pushes the rows to the viewport.rows array.
     */
    public render(): void {
        const columns = this.viewport.columns;

        for (let i = 0, iEnd = columns.length; i < iEnd; i++) {
            const cell = this.createCell(columns[i]);
            cell.render();
        }

        this.reflow();
    }

    /**
     * Reflows the row's content dimensions.
     */
    public reflow(): void {
        for (let j = 0, jEnd = this.cells.length; j < jEnd; ++j) {
            this.cells[j].reflow();
        }

        const vp = this.viewport;
        if (vp.rowsWidth) {
            this.htmlElement.style.width = vp.rowsWidth + 'px';
        }
    }

    /**
     * Destroys the row.
     */
    public destroy(): void {
        this.destroyed = true;

        if (!this.htmlElement) {
            return;
        }

        for (let i = 0, iEnd = this.cells.length; i < iEnd; ++i) {
            this.cells[i].destroy();
        }

        this.htmlElement.remove();
    }

    /**
     * Registers a cell in the row.
     *
     * @param cell
     * The cell to register.
     */
    public registerCell(cell: Cell): void {
        this.cells.push(cell);
    }

    /**
     * Unregister a cell from the row.
     *
     * @param cell
     * The cell to unregister.
     */
    public unregisterCell(cell: Cell): void {
        if (this.destroyed) {
            return;
        }

        const index = this.cells.indexOf(cell);
        if (index > -1) {
            this.cells.splice(index, 1);
        }
    }

    public setRowAttributes(): void {
        const el = this.htmlElement;
        el.setAttribute('aria-rowindex', this.index);
    }
}


/* *
 *
 *  Class Namespace
 *
 * */

namespace Row {

}


/* *
 *
 *  Default Export
 *
 * */

export default Row;

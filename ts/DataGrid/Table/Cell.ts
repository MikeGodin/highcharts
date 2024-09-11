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

import type DataTable from '../../Data/DataTable';

import AST from '../../Core/Renderer/HTML/AST.js';
import Column from './Column';
import Row from './Row';
import Templating from '../../Core/Templating.js';


/* *
 *
 *  Abstract Class of Cell
 *
 * */
abstract class Cell {

    /* *
    *
    *  Properties
    *
    * */

    /**
     * The HTML element of the cell.
     */
    public htmlElement: HTMLTableCellElement;

    /**
     * The column of the cell.
     */
    public column: Column;

    /**
     * The row of the cell.
     */
    public row: Row;

    /**
     * The raw value of the cell.
     */
    public value: DataTable.CellType;

    /**
     * An additional, custom class name that can be changed dynamically.
     */
    private customClassName?: string;


    /* *
    *
    *  Constructor
    *
    * */

    /**
     * Constructs a cell in the data grid.
     *
     * @param column
     * The column of the cell.
     *
     * @param row
     * The row of the cell.
     */
    constructor(column: Column, row: Row) {

        this.column = column;
        this.row = row;
        this.row.registerCell(this);

        this.htmlElement = this.init();
    }


    /* *
    *
    *  Methods
    *
    * */

    /**
     * Init element.
     * @internal
     */
    public init(): HTMLTableCellElement {
        return document.createElement('td', {});
    }

    /**
     * Renders the cell by appending the HTML element to the row.
     */
    public render(): void {
        this.row.htmlElement.appendChild(this.htmlElement);
    }

    /**
     * Reflows the cell dimensions.
     */
    public reflow(): void {
        const column = this.column;
        const elementStyle = this.htmlElement.style;

        elementStyle.width = elementStyle.maxWidth = column.getWidth() + 'px';
    }

    /**
     * Returns the formatted string where the templating context is the cell.
     *
     * @param template
     * The template string.
     *
     * @return
     * The formatted string.
     */
    public format(template: string): string {
        return Templating.format(template, this);
    }

    /**
     * Sets the custom class name of the cell based on the template.
     *
     * @param template
     * The template string.
     */
    protected setCustomClassName(template?: string): void {
        const element = this.htmlElement;

        if (this.customClassName) {
            element.classList.remove(this.customClassName);
        }

        if (!template) {
            delete this.customClassName;
            return;
        }

        const newClassName = this.format(template).replace(/\s+/g, '-');
        if (!newClassName) {
            delete this.customClassName;
            return;
        }

        element.classList.add(newClassName);
        this.customClassName = newClassName;
    }

    /**
     * Renders content of cell.
     *
     * @param cellContent
     * Content to render.
     *
     * @param parentElement
     * Parent element where the content should be.
     *
     * @internal
     */
    public renderHTMLCellContent(
        cellContent: string,
        parentElement: HTMLElement
    ): void {
        const formattedNodes = new AST(cellContent);
        formattedNodes.addToDOM(parentElement);
    }

    /**
     * Destroys the cell.
     */
    public destroy(): void {
        this.column.unregisterCell(this);
        this.row.unregisterCell(this);
        this.htmlElement.remove();
    }
}


/* *
 *
 *  Class Namespace
 *
 * */

namespace Cell {

}


/* *
 *
 *  Default Export
 *
 * */

export default Cell;

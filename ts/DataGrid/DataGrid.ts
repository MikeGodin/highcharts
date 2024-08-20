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

import type Options from './Options';
import type DataTableOptions from '../Data/DataTableOptions';

import AST from '../Core/Renderer/HTML/AST.js';
import DataGridDefaultOptions from './DefaultOptions.js';
import Table from './Table.js';
import DataGridUtils from './Utils.js';
import DataTable from '../Data/DataTable.js';
import QueryingController from './Querying/QueryingController.js';
import Globals from './Globals.js';
import U from '../Core/Utilities.js';

const { makeDiv, makeHTMLElement } = DataGridUtils;
const { win } = Globals;
const { merge } = U;


/* *
 *
 *  Class
 *
 * */

/**
 * Creates a grid structure (table).
 */
class DataGrid {

    /* *
    *
    *  Static Methods
    *
    * */

    /**
     * Creates a new data grid.
     *
     * @param renderTo
     * The render target (html element or id) of the data grid.
     *
     * @param options
     * The options of the data grid.
     *
     * @return The new data grid.
     *
     * @param afterLoadCallback
     * The callback that is called after the data grid is loaded.
     */
    public static dataGrid(
        renderTo: string|HTMLElement,
        options: Options,
        afterLoadCallback?: DataGrid.AfterLoadCallback
    ): DataGrid {
        return new DataGrid(renderTo, options, afterLoadCallback);
    }

    /**
     * Initializes the container of the data grid.
     *
     * @param renderTo
     * The render target (html element or id) of the data grid.
     *
     * @returns
     * The container element of the data grid.
     */
    private static initContainer(renderTo: string|HTMLElement): HTMLElement {
        if (typeof renderTo === 'string') {
            const existingContainer = win.document.getElementById(renderTo);
            if (existingContainer) {
                return existingContainer;
            }
            return makeDiv(Globals.classNames.container, renderTo);
        }
        renderTo.classList.add(Globals.classNames.container);
        return renderTo;
    }


    /* *
    *
    *  Properties
    *
    * */

    /**
     * Default options for all DataGrid instances.
     * @internal
     */
    public static readonly defaultOptions = DataGridDefaultOptions;


    /**
     * The container of the data grid.
     */
    public container?: HTMLElement;

    /**
     * The data source of the data grid. It contains the original data table
     * that was passed to the data grid.
     */
    public dataTable?: DataTable;

    /**
     * The presentation table of the data grid. It contains a modified version
     * of the data table that is used for rendering the data grid content. If
     * not modified, just a reference to the original data table.
     */
    public presentationTable?: DataTable;

    /**
     * The HTML element of the table.
     */
    public tableElement?: HTMLTableElement;

    /**
     * The options of the data grid. Contains the options that were declared
     * by the user and some of the default options.
     */
    public options?: Options;

    /**
     * The options that were declared by the user when creating the data grid
     * or when updating it.
     */
    public userOptions?: Partial<Options>;

    /**
     * The table (viewport) element of the data grid.
     */
    public viewport?: Table;

    /**
     * The list of columns that are displayed in the data grid.
     * @internal
     */
    public enabledColumns?: string[];

    /**
     * The hovered row index.
     * @internal
     */
    public hoveredRowIndex?: number;

    /**
     * The hovered column ID.
     * @internal
     */
    public hoveredColumnId?: string;

    /**
     * The querying controller.
     */
    public querying: QueryingController;


    /* *
    *
    *  Constructor
    *
    * */

    /**
     * Constructs a new data grid.
     *
     * @param renderTo
     * The render target (container) of the data grid.
     *
     * @param options
     * The options of the data grid.
     *
     * @param afterLoadCallback
     * The callback that is called after the data grid is loaded.
     */
    constructor(
        renderTo: string | HTMLElement,
        options: Options,
        afterLoadCallback?: DataGrid.AfterLoadCallback
    ) {
        this.userOptions = options;
        this.options = merge(DataGrid.defaultOptions, options);

        this.querying = new QueryingController(this);

        this.container = DataGrid.initContainer(renderTo);
        this.container.classList.add(Globals.classNames.container);

        this.loadDataTable(this.options.table);

        this.querying.loadOptions();
        void this.querying.proceed().then((): void => {
            this.renderViewport();
            afterLoadCallback?.(this);
        });
    }


    /* *
     *
     *  Methods
     *
     * */

    /**
     * Updates the data grid with new options.
     *
     * @param options
     * The options of the data grid that should be updated.
     *
     * @param render
     * Whether to re-render the data grid after updating the options.
     */
    public async update(
        options: Options,
        render: boolean = true
    ): Promise<void> {
        this.userOptions = merge(this.userOptions, options);
        this.options = merge(DataGrid.defaultOptions, this.userOptions);

        let newDataTable = false;
        if (!this.dataTable || options.table) {
            this.loadDataTable(this.options?.table);
            newDataTable = true;
        }

        this.querying.loadOptions();
        await this.querying.proceed(newDataTable);

        if (render) {
            this.renderViewport();
        }
    }

    /**
     * Hovers the row with the provided index. It removes the hover effect from
     * the previously hovered row.
     *
     * @param rowIndex
     * The index of the row.
     */
    public hoverRow(rowIndex?: number): void {
        const rows = this.viewport?.rows;
        if (!rows) {
            return;
        }

        const firstRowIndex = this.viewport?.rows[0]?.index ?? 0;

        if (this.hoveredRowIndex !== void 0) {
            rows[this.hoveredRowIndex - firstRowIndex]?.setHoveredState(false);
        }

        if (rowIndex !== void 0) {
            rows[rowIndex - firstRowIndex]?.setHoveredState(true);
        }

        this.hoveredRowIndex = rowIndex;
    }

    /**
     * Hovers the column with the provided ID. It removes the hover effect from
     * the previously hovered column.
     *
     * @param columnId
     * The ID of the column.
     */
    public hoverColumn(columnId?: string): void {
        const vp = this.viewport;

        if (!vp) {
            return;
        }

        if (this.hoveredColumnId) {
            vp.getColumn(this.hoveredColumnId)?.setHoveredState(false);
        }

        if (columnId) {
            vp.getColumn(columnId)?.setHoveredState(true);
        }

        this.hoveredColumnId = columnId;
    }

    /**
     * Renders the viewport of the data grid. If the data grid is already
     * rendered, it will be destroyed and re-rendered with the new data.
     * @internal
     */
    public renderViewport(): void {
        let vp = this.viewport;
        const viewportMeta = vp?.getStateMeta();

        this.enabledColumns = this.getEnabledColumnIDs();
        vp?.destroy();
        if (this.container) {
            this.container.innerHTML = AST.emptyHTML;
        }

        if (this.enabledColumns.length > 0) {
            this.renderTable();
            vp = this.viewport;
            if (viewportMeta && vp) {
                vp.applyStateMeta(viewportMeta);
            }
        } else {
            this.renderNoData();
        }
    }

    /**
     * Renders the table (viewport) of the data grid.
     */
    private renderTable(): void {
        if (!this.container) {
            return;
        }

        this.tableElement = makeHTMLElement('table', {
            className: Globals.classNames.tableElement
        }, this.container);

        this.viewport = new Table(this, this.tableElement);

        // Accessibility
        this.tableElement.setAttribute(
            'aria-rowcount',
            this.dataTable?.getRowCount() ?? 0
        );
    }

    /**
     * Renders a message that there is no data to display.
     */
    private renderNoData(): void {
        if (!this.container) {
            return;
        }

        makeHTMLElement('div', {
            className: Globals.classNames.noData,
            innerText: 'No data to display'
        }, this.container);
    }

    /**
     * Returns the array of IDs of columns that should be displayed in the data
     * grid, in the correct order.
     */
    private getEnabledColumnIDs(): string[] {
        const columnsOptions = this.options?.columns;
        const columnsIncluded =
            this.options?.settings?.columns?.included ??
            this.dataTable?.getColumnNames();

        if (!columnsIncluded?.length) {
            return [];
        }

        let columnName: string;
        const result: string[] = [];
        for (let i = 0, iEnd = columnsIncluded.length; i < iEnd; ++i) {
            columnName = columnsIncluded[i];
            if (columnsOptions?.[columnName]?.enabled !== false) {
                result.push(columnName);
            }
        }

        return result;
    }

    private loadDataTable(tableOptions?: DataTable | DataTableOptions): void {
        // If the table is passed as a reference, it should be used instead of
        // creating a new one.
        if (tableOptions?.id) {
            this.dataTable = tableOptions as DataTable;
            this.presentationTable = this.dataTable.modified;
            return;
        }

        this.dataTable = this.presentationTable =
            new DataTable(tableOptions as DataTableOptions);
    }

    /**
     * Destroys the data grid.
     */
    public destroy(): void {
        this.viewport?.destroy();

        if (this.container) {
            this.container.innerHTML = AST.emptyHTML;
            this.container.classList.remove(Globals.classNames.container);
        }

        // Clear all properties
        Object.keys(this).forEach((key): void => {
            delete this[key as keyof this];
        });
    }

    /**
     * Returns the current dataGrid data as a JSON string.
     *
     * @return
     * JSON representation of the data
     */
    public getJSON(): string {
        const json = this.viewport?.dataTable.modified.columns;

        if (!this.enabledColumns || !json) {
            return '{}';
        }

        for (const key of Object.keys(json)) {
            if (this.enabledColumns.indexOf(key) === -1) {
                delete json[key];
            }
        }

        return JSON.stringify(json);
    }
}


/* *
 *
 *  Class Namespace
 *
 * */
namespace DataGrid {
    export type AfterLoadCallback = (dataGrid: DataGrid) => void;
}


/* *
 *
 *  Default Export
 *
 * */

export default DataGrid;

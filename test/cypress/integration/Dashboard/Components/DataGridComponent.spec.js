describe('layout resize on window changes', () => {
    before(()=>{
        cy.visit('/dashboard/demos/dashboard-datagrid-component');
    });

    it('Chart and DataGridComponent should have synced hover events.', () => {
        const firstDataGridRow = cy.get('.hc-dg-cell').eq(0)

        // Hover over DataGridComponent.
        firstDataGridRow.trigger('mouseover');
        firstDataGridRow.parent().should('have.class', 'hc-dg-row hovered');
        cy.chart().then(chart =>{
            assert.notOk(
                chart.tooltip.isHidden,
                'When hovering over DataGrid, chart should have tooltip.'
            )
        })

        // Hover over the chart.
        cy.get('.highcharts-point').eq(1).trigger('mouseover');
        firstDataGridRow.parent().should('not.have.class', 'hc-dg-row hovered');
        cy.get('.hc-dg-row').eq(1).should('have.class', 'hc-dg-row hovered');
    });
});

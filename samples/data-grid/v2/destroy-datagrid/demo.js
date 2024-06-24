const options = {
    table: {
        columns: {
            product: ['Apples', 'Pears', 'Plums', 'Bananas'],
            weight: [100, 40, 0.5, 200],
            price: [1.5, 2.53, 5, 4.5],
            metaData: ['a', 'b', 'c', 'd'],
            icon: ['Apples URL', 'Pears URL', 'Plums URL', 'Bananas URL']
        }
    }
};
let dg = DataGrid.dataGrid2('container', options);

document.getElementById('destroy-btn').addEventListener('click', () => {
    dg.destroy();
    console.log('destroyed:', dg);
});

document.getElementById('load-btn').addEventListener('click', () => {
    dg = new DataGrid.DataGrid2('container', options);
    console.log('created:', dg);
});

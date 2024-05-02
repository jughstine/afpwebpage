var currentPage = 0;
var rowsPerPage = 10;
var dataTable = document.getElementById('dataTable');
var rows = dataTable.rows;

function showRows() {
    var startIndex = currentPage * rowsPerPage;
    var endIndex = startIndex + rowsPerPage;

    for (var i = 0; i < rows.length; i++) {
        if (i >= startIndex && i < endIndex) {
            rows[i].style.display = 'table-row';
        } else {
            rows[i].style.display = 'none';
        }
    }
}

function nextPage() {
    if ((currentPage + 1) * rowsPerPage < rows.length) {
        currentPage++;
        showRows();
    }
}

function previousPage() {
    if (currentPage > 0) {
        currentPage--;
        showRows();
    }
}

showRows();

document.addEventListener('DOMContentLoaded', function() {
    var dataTable = document.getElementById('dataTable');

    // Attach the click event listener to the dataTable instead of individual rows
    dataTable.addEventListener('click', function(event) {
        var clickedRow = event.target.closest('tr'); // Find the closest tr ancestor of the clicked element

        if (clickedRow) { // Check if a row was actually clicked
            // Remove 'clicked' class from all rows
            var rows = this.rows; // 'this' refers to dataTable
            for (var i = 0; i < rows.length; i++) {
                rows[i].classList.remove('clicked');
            }

            // Add 'clicked' class to the clicked row
            clickedRow.classList.add('clicked');
        }
    });
});
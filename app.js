"use strict";
//class for ir entry objects
class Ieentry {
    constructor(ie, datee, name, amount) {
        this.ie = ie;
        this.name = name;
        this.amount = amount;
        this.date = new Date(datee);
    }
}
//UI class with all the UI methods
class UI {
    addieentrytoList(ieentry) {
        const list = document.getElementById('ie-list');
        const row = document.createElement('tr');
        let d = ieentry.date.getDate();
        let m = ieentry.date.getMonth();
        let dstring = '';
        if (m > 8) {
            dstring += `${m + 1}/`;
        }
        else {
            dstring += `0${m + 1}/`;
        }
        if (d > 9) {
            dstring += `${d}/`;
        }
        else {
            dstring += `0${d}/`;
        }
        dstring += `${ieentry.date.getFullYear()}`;
        row.innerHTML = `
            <td>${ieentry.ie}</td>
            <td>${dstring}</td>
            <td>${ieentry.name}</td>
            <td>${ieentry.amount}</td>
            <td><a href="#" class="delete">&times<a></td>
            `;
        if ((ieentry.ie == 'I'))
            row.style.backgroundColor = '#67e467';
        else
            row.style.backgroundColor = '#e94f4f';
        list.appendChild(row);
    }
    showAlert(message, className) {
        const alertdiv = document.getElementById('alert');
        alertdiv.className = `${className}`;
        alertdiv.textContent = message;
        setTimeout(function () {
            alertdiv.className = "hide";
        }, 3000);
    }
    deleteieentry(target) {
        ((target.parentElement).parentElement).remove();
    }
    // after a successful sumbil
    clearTextarea() {
        document.getElementById('ie-input').value = '';
    }
    filterfunc(filter) {
        let filterby = +document.getElementById('filterby').value; //filterby as a number for comparing the right child ie,date,name,amount as 0,1,2 &3 
        let rows = document.getElementById('ie-list').children;
        for (let i = 0; i < rows.length; i++) {
            let row = rows[i];
            if (filter == '') // for the filterby change listner
             {
                row.style.display = "";
            }
            else if (row.children[filterby].textContent.toUpperCase().indexOf(filter) > -1) {
                row.style.display = "";
            }
            else {
                row.style.display = "none";
            }
        }
    }
}
//the class with methods to manipulate disck storage
class LocalStore {
    static getieentriesfromLS() {
        let ieentriesdateasstring = [];
        let ieentries = [];
        if (localStorage.getItem('ieentries') === null) {
            ieentriesdateasstring = []; //if there is no data in local storage(when the application is run for the first time)
        }
        else {
            ieentriesdateasstring = JSON.parse(localStorage.getItem('ieentries'));
            for (let i = 0; i < ieentriesdateasstring.length; i++) // upgrading the type of date from string to date
             {
                let ie = ieentriesdateasstring[i].ie;
                let date = ieentriesdateasstring[i].date;
                let name = ieentriesdateasstring[i].name;
                let amount = ieentriesdateasstring[i].amount;
                let ieentryobject = new Ieentry(ie, date, name, amount);
                ieentries.push(ieentryobject);
            }
        }
        return ieentries;
    }
    //during reaload (with the total calculations)
    static displayieentries() {
        const ieentries = LocalStore.getieentriesfromLS();
        let income = Number(document.getElementById('ti').innerHTML);
        let expense = Number(document.getElementById('te').innerHTML);
        ieentries.forEach(function (ieentry) {
            const ui = new UI();
            if (ieentry.ie == 'I') {
                income += Number(ieentry.amount);
            }
            else {
                expense += Number(ieentry.amount);
            }
            ui.addieentrytoList(ieentry);
        });
        document.getElementById('ti').innerHTML = `${income}`;
        document.getElementById('te').innerHTML = `${expense}`;
        document.getElementById('b').innerHTML = `${+(income - expense)}`;
    }
    static addieentry(ieentry) {
        const ieentries = LocalStore.getieentriesfromLS();
        ieentries.push(ieentry); //(here date is actually a Date())
        localStorage.setItem('ieentries', JSON.stringify(ieentries)); //date will be converted into a string  
    }
    static removeieentry(ieentrytobedeleted) {
        const ieentries = LocalStore.getieentriesfromLS();
        let found = false; //to prevent deletion of all entries
        ieentries.forEach(function (ieentry, index) {
            if ((found == false) && (JSON.stringify(ieentry) === JSON.stringify(ieentrytobedeleted))) { //for proper object comparison, date is a Date() from getieentriesfromLS()
                ieentries.splice(index, 1);
                found = true;
            }
        });
        localStorage.setItem('ieentries', JSON.stringify(ieentries));
    }
}
// the class with validation and processing of data
class Data {
    static validateAndProcess(datainCSV) {
        const ui = new UI();
        if (datainCSV == '') {
            ui.showAlert('Input is empty! Enter the value in CSV fromat with header', 'error');
            return false;
        }
        //for altering the total values
        let income = Number(document.getElementById('ti').innerHTML);
        let expense = Number(document.getElementById('te').innerHTML);
        let arr = datainCSV.split('\n');
        //verifying header     
        let hd = arr[0].split(',');
        if (hd.length !== 4) {
            ui.showAlert('Header is incorrect! Enter the value in CSV fromat with header', 'error');
            return false;
        }
        for (let i = 0; i < 4; i++) {
            hd[i] = hd[i].toUpperCase().trim();
        }
        if (!(((hd[0] === 'I-E') || (hd[0] === 'IE') || (hd[0] === 'I/E')) && (hd[1] === 'DATE') && (hd[2] === 'NAME') && (hd[3] === 'AMOUNT'))) {
            ui.showAlert('Header is not correct! Enter the value in CSV fromat with header', 'error');
            return false;
        }
        // done with header verification
        //checking if it only the header
        if (arr.length == 1) {
            ui.showAlert('Only header is present! Enter the value in CSV fromat below header', 'error');
            return false;
        }
        //chechking id the last line is empty
        if (arr[arr.length - 1] == '') {
            ui.showAlert('Last line is empty! Do not enter a linebreak after the last entry.', 'error');
            return false;
        }
        //verifying the content
        for (let i = 1; i < arr.length; i++) //validating each entry
         {
            let data = arr[i].split(',');
            for (let j = 0; j < 4; j++) //triming and checking for empty values
             {
                data[j] = data[j].trim();
                if (data[j] == '') {
                    ui.showAlert(`${hd[j]} of entry number ${i} is empty`, 'error');
                    return false;
                }
            }
            if (data.length != 4) // checking for more values
             {
                ui.showAlert(`${data.length} values in entry number ${i}.`, 'error');
                return false;
            }
            if (!((data[0].toUpperCase() == 'I') || (data[0].toUpperCase() == 'E'))) {
                ui.showAlert(`I/E type of entry number ${i} is not correct`, 'error');
                return false;
            }
            const thedate = new Date(`${data[1]}`);
            const stringvalue = thedate.toString(); //converting over gate to sring for comparison with invalid date
            if (stringvalue == 'Invalid Date') {
                ui.showAlert(`Date of entry number ${i} is not correct`, 'error');
                return false;
            }
            if (isNaN(+data[3])) // checking if amount is a number
             {
                ui.showAlert(`Amount of entry number ${i} is not a valid number`, 'error');
                return false;
            }
            if ((+data[3]) < 0) // checking if amount is negative
             {
                ui.showAlert(`Amount of entry number ${i} is negative`, 'error');
                return false;
            }
        }
        console.log('positive validation');
        //after positive valifation of the entire input
        //entering the inputs to the local storage and the browser/list/DOM
        for (let i = 1; i < arr.length; i++) {
            let data = arr[i].split(',');
            const ieentry = new Ieentry(data[0].toUpperCase().trim(), data[1].trim(), data[2].trim(), data[3].trim());
            ui.addieentrytoList(ieentry);
            if (ieentry.ie == 'I') {
                income += Number(ieentry.amount);
            }
            else {
                expense += Number(ieentry.amount);
            }
            LocalStore.addieentry(ieentry);
        }
        document.getElementById('ti').innerHTML = `${income}`;
        document.getElementById('te').innerHTML = `${expense}`;
        document.getElementById('b').innerHTML = `${+(income - expense)}`;
        ui.showAlert('Entries are added successfully!', 'success');
        ui.clearTextarea();
        return true;
    }
}
//EVENT LISTNERS
// DOM load event, just calling the displayieentries to diplay the data from LS
document.addEventListener('DOMContentLoaded', function (e) {
    LocalStore.displayieentries();
    //e.preventDefault();
});
//even listner for delete
document.getElementById('tablecontainer').addEventListener('click', function (e) {
    let tar = e.target;
    if (tar.className == 'delete') // ensuring the click is on the X
     {
        const ui = new UI();
        //collecting all the values of the row to be deleted  
        const amount = tar.parentElement.previousElementSibling.textContent;
        const name = tar.parentElement.previousElementSibling.previousElementSibling.textContent;
        const date = tar.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.textContent;
        const ie = tar.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.textContent;
        ui.deleteieentry(tar);
        //updating totals
        let income = Number(document.getElementById('ti').innerHTML);
        let expense = Number(document.getElementById('te').innerHTML);
        if (ie == 'I') //crosschecking with the ie value collected
         {
            income -= Number(amount);
        }
        else {
            expense -= Number(amount);
        }
        document.getElementById('ti').innerHTML = `${income}`;
        document.getElementById('te').innerHTML = `${expense}`;
        document.getElementById('b').innerHTML = `${+(income - expense)}`;
        const ieentry = new Ieentry(ie, date, name, amount); //generating an istance of the ieentry class to pass the values for deletion fro local storage
        LocalStore.removeieentry(ieentry);
        ui.showAlert('The entry has been removed!', 'success');
        e.preventDefault();
    }
});
//event listner for sorting change
document.getElementById('sortby').addEventListener('change', function (e) {
    const sortby = document.getElementById('sortby').value;
    //empty thetable
    document.getElementById('ie-list').innerHTML = '';
    // getting value from ls
    let ieentries = LocalStore.getieentriesfromLS();
    let ui = new UI();
    if (ieentries.length == 0) { //verifying there is some data to be sorte
        ui.showAlert('No entries to be sorted', 'error');
    }
    else {
        //sorting as per the value of sortby
        if (sortby == 'ie') {
            ieentries.sort(function (a, b) {
                var x = a.ie.toLowerCase();
                var y = b.ie.toLowerCase();
                if (x < y) {
                    return -1;
                }
                if (x > y) {
                    return 1;
                }
                return 0;
            });
            ui.showAlert('Entries sorted by I/E value!', 'success');
        }
        else if (sortby == 'name') {
            ieentries.sort(function (a, b) {
                var x = a.name.toLowerCase();
                var y = b.name.toLowerCase();
                if (x < y) {
                    return -1;
                }
                if (x > y) {
                    return 1;
                }
                return 0;
            });
            ui.showAlert('Entries sorted by Name!', 'success');
        }
        else if (sortby == 'amount') {
            ieentries.sort(function (a, b) { return +a.amount - +b.amount; });
            ui.showAlert('Entries sorted by Amount!', 'success');
        }
        else if (sortby == 'date') {
            ieentries.sort(function (a, b) { return a.date.getTime() - b.date.getTime(); });
            ui.showAlert('Entries sorted by Date!', 'success');
        }
        else if (sortby == '') { //for sort by time of entry. simply printing from ls, no sort involved
            ui.showAlert('Entries in the order of logging!', 'success');
        }
        //printing it to the list/table
        ieentries.forEach(function (ieentry) {
            ui.addieentrytoList(ieentry);
        });
        // once printed filtering as per the values in the filterby and filter input box
        ui.filterfunc(document.getElementById('filter').value.toUpperCase());
        document.getElementById('sortby').value = 'default'; // setting to an undefined option to include re sorting with the same category, inordder to include it in the change redar
        e.preventDefault();
    }
});
//event listner to clear filtervalue when filterby is changed
document.getElementById('filterby').addEventListener('change', function (e) {
    document.getElementById('filter').value = '';
    let ui = new UI();
    ui.filterfunc(''); // ensureinf no filtering is done with the previous filter value
    e.preventDefault();
});
//event listner whne value is changes by keydown
document.getElementById('filter').addEventListener('keyup', function (e) {
    const ui = new UI();
    ui.filterfunc(e.target.value.toUpperCase());
    //e.preventDefault(); // not sure abouts it effect
});
//even listner for submit
document.getElementById('submitbtn').addEventListener('click', function (e) {
    const datainCSV = document.getElementById('ie-input').value;
    //let dp= new DataProcessing();
    console.log('created new object and calling valifate fucntion next');
    //let validation= dp.validateAndProcess(datainCSV);
    //const vali=dp.validateAndProcess(datainCSV);
    const vali = Data.validateAndProcess(datainCSV);
    console.log('validation and entry over');
    e.preventDefault();
});

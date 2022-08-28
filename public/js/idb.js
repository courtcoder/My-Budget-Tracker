let db;

const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_budget_data', { autoIncrement: true });

}

request.onsuccess = function (event) {
    db = event.target.result;

    if (navigator.onLine) {
        uploadBudgetData();
    }
}

request.onerror = function (event) {
    console.log(event.target.errorCode);
}

function saveData(record) {
    const transaction = db.transaction(['new_budget_data'], 'readwrite');
    const dataObjectStore = transaction.objectStore('new_budget_data');
    dataObjectStore.add(record);
}

function uploadBudgetData() {
    const transaction = db.transaction(['new_budget_data'], 'readwrite');
    const dataObjectStore = transaction.objectStore('new_budget_data');
    const getAll = dataObjectStore.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
            })
                .then(response => response.json())
                .then((severRes) => {
                    const transaction = db.transaction(['new_budget_data'], 'readwrite');
                    const dataObjectStore = transaction.objectStore('new_budget_data');
                    dataObjectStore.clear();
                    window.alert("All new budget data was successfully uploaded");
                })
                
            .catch ((err) => {
                console.log(err);
            })
        }
    }
}
window.addEventListener('online', uploadBudgetData);
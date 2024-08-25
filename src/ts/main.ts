/* DT208G - Programmering i TypeScript
 * Moment 1
 * Linn Eriksson, VT24
 */

//Interface for course
interface Course {
    code: string;
    name: string;
    progression: string;
    syllabus: string;
}


//Function that runs when the window has loaded.
window.onload = (): void => {
    
    //Get DOM-element of form.
    const courseForm = document.getElementById("addcourse") as HTMLFormElement;

    //Add eventlistener to form.
    courseForm.addEventListener("submit", addCourse);

    //Print courses if there are any.
    let listOfCourses: Course[] = [];
    let storedCourses = localStorage.getItem("courses") as string;

    if(storedCourses == null){
        //If the localStorage-item doesn't exist this saves the code from breaking later.
        storedCourses = `[{}]`;
    } else {
        
        listOfCourses = JSON.parse(storedCourses);
        printCourses(listOfCourses);
    }
}


//Adding courses
function addCourse(submit: Event): void {
    submit.preventDefault();

    //Get values from form.
    const codeInput = document.getElementById("course_code") as HTMLInputElement;
    const nameInput = document.getElementById("course_name") as HTMLInputElement;
    const progressionInput = document.getElementById("progression") as HTMLInputElement;

    //Validate input.
    let codeLength: number = codeInput.value.length;
    if(codeLength === 6) {
        let nameLength: number = nameInput.value.length;

        if(nameLength > 8 && nameLength < 65) {
            let progressionLength: number = progressionInput.value.length;

            if(progressionLength === 1) {

                //Variables to transform needed parts to uppercase and for cleaner look.
                let courseCode: string = codeInput.value.toUpperCase();
                let courseName: string = nameInput.value;
                let courseProgression: string = progressionInput.value.toUpperCase();
                let courseSyllabus: string = "https://www.miun.se/utbildning/kursplaner-och-utbildningsplaner/" + courseCode;

                const newCourse: Course = {
                    code: courseCode,
                    name: courseName,
                    progression: courseProgression,
                    syllabus: courseSyllabus
                }
                
                let courses: Course[] = saveCourse(newCourse);
                printCourses(courses);
                clearForm(codeInput, nameInput, progressionInput);
            }
        }
    }
}

//Saving course.
function saveCourse(course: Course): Course[] {
    let listOfCourses: Course[] = [];
    let storedCourses = localStorage.getItem("courses") as string;

    if(storedCourses == null){
        //Should be pretty much impossible to end up here, but this keeps TS from screaming.
        storedCourses = `[{}]`;
    }

    listOfCourses = JSON.parse(storedCourses);

    listOfCourses.push(course);

    let jsonStr= JSON.stringify(listOfCourses);

    localStorage.setItem("courses", jsonStr);

    return listOfCourses;
}

//Writing out courses.
function printCourses(courses: Course[]): void {
    const coursesDiv = document.getElementById("coursesdiv") as HTMLDivElement; 

    if (coursesDiv) {
        //Clear text from div.
        coursesDiv.innerHTML = " ";

        //Create table-elements needed.
        let table: HTMLTableElement = document.createElement("table");
        let tableHeader: HTMLTableSectionElement = document.createElement("thead");
        let tableBody: HTMLTableSectionElement = document.createElement("tbody");
        const trH: HTMLTableRowElement = tableHeader.insertRow();

        //Add headers and content.
        trH.innerHTML = "<th>Kurskod</th><th>Kursnamn</th><th>Progression</th><th>Uppdatera</th><th>Radera</th>";

        //Use foreach to add each row of the table.
        courses.forEach(course=> {
            //Check as to not write out the empty object created when localStorage-item is created.
            if(course.code != undefined) {
                const trB: HTMLTableRowElement = tableBody.insertRow();
                trB.innerHTML = `<td id="code_${course.code}" contenteditable><a href="${course.syllabus}">${course.code}</a></td><td id="name_${course.code}" contenteditable>${course.name}</td><td id="progression_${course.code}" contenteditable>${course.progression}</td><td><button class="update button" id="update_${course.code}">Uppdatera</button></td><td><button class="delete button" id="delete_${course.code}">Radera</button></td>`;
            }
        });

        //Create actual table and append to div.
        table.appendChild(tableHeader);
        table.appendChild(tableBody);
        coursesDiv.appendChild(table);

        //Make update- and deletbuttons work.
        const updateButtons = document.querySelectorAll("button.update") as NodeListOf<HTMLButtonElement>;
        const deleteButtons = document.querySelectorAll("button.delete") as NodeListOf<HTMLButtonElement>;

        //Add eventlisteners to all buttons.
        for (let i = 0; i < updateButtons.length; i++) {
            updateButtons[i].addEventListener("click", updateCourse);
            deleteButtons[i].addEventListener("click", deleteCourse);
            
        }
    }
}

//Function for updating courses.
function updateCourse(event: Event): void {
    let updateBtn = event.target as HTMLButtonElement;
    let id: string = updateBtn.id;
    let listOfCourses: Course[] = [];
    let storedCourses = localStorage.getItem("courses") as string;

    if(storedCourses == null){
        //It should be pretty much impossible to end up here, but TS screams at you if this isn't here. :)
        storedCourses = `[{}]`;
    }

    listOfCourses = JSON.parse(storedCourses);

    //For loop that checks all courses in list.
    for (let i: number = 0; i < listOfCourses.length; i++) {
        const course: Course = listOfCourses[i];

        //Slice away update_ from the id of the button-element and check if the coursecode matches with the one we want to update.
        let code: string = id.slice(7);
        if(code === course.code){

            //Variables for IDs and cells as it will be easier to keep track of this way.
            let courseCodeId: string = "code_" + code;
            let courseNameId: string = "name_" + code;
            let courseProgressionId: string = "progression_" + code;

            let courseCodeCell = document.getElementById(courseCodeId) as HTMLTableCellElement;
            let courseNameCell = document.getElementById(courseNameId) as HTMLTableCellElement;
            let courseProgressionCell = document.getElementById(courseProgressionId) as HTMLTableCellElement;

            let courseCode = courseCodeCell.textContent as string;
            let courseName = courseNameCell.textContent as string;
            let courseProgression = courseProgressionCell.textContent as string;
            let courseSyllabus: string = "https://www.miun.se/utbildning/kursplaner-och-utbildningsplaner/" + courseCode;

            //Create a new course-object.
            const newCourse: Course = {
                code: courseCode.toUpperCase(),
                name: courseName,
                progression: courseProgression.toUpperCase(),
                syllabus: courseSyllabus
            }

            //Remove the item were the code and id matches, and add the new info instead.
            listOfCourses.splice(i, 1, newCourse);
            
            //Save spliced array to localStorage.
            let jsonStr= JSON.stringify(listOfCourses);
            localStorage.setItem("courses", jsonStr);

            //Print new array.
            printCourses(listOfCourses);

            //For-loop can be closed now as it's done.
            i = listOfCourses.length + 1;
        }
    }
}

//Function for deleting courses.
function deleteCourse(event: Event): void {
    let deleteBtn = event.target as HTMLButtonElement;
    let id: string = deleteBtn.id;
    let listOfCourses: Course[] = [];
    let storedCourses = localStorage.getItem("courses") as string;

    if(storedCourses == null){
        //It should be pretty much impossible to end up here, but TS screams at you if this isn't here. :)
        storedCourses = `[{}]`;
    }

    listOfCourses = JSON.parse(storedCourses);

    //For loop that checks all courses in list.
    for (let i: number = 0; i < listOfCourses.length; i++) {
        const course: Course = listOfCourses[i];

        //Slice away delete_ from the id of the button and check if the code matches with the one we want to delete.
        let code: string = id.slice(7);
        if(code === course.code){

            //Remove the item were the code and id matches.
            listOfCourses.splice(i, 1);
            
            //Save spliced array to localStorage.
            let jsonStr= JSON.stringify(listOfCourses);
            localStorage.setItem("courses", jsonStr);

            //Print new array.
            printCourses(listOfCourses);

            //For-loop can be closed now as it's done.
            i = listOfCourses.length + 1;
        }
    }
}

//Function to clear form.
function clearForm(codeInput: HTMLInputElement, nameInput: HTMLInputElement, progressionInput: HTMLInputElement): void {
    codeInput.value = ""; 
    nameInput.value = ""; 
    progressionInput.value = "";

}
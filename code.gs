//Created by TGeorgeLearning/Tristan George George

let parentForm = FormApp.openById(''); // Enter the ID for the Google Form used by the parents
let tutForm = FormApp.openById(''); // Enter the ID for Google Form used by the tutors to sign up
let subjectDictionary = {};
let subjectArr=[];
let existingNames=[];


let tutorResponseSheet= SpreadsheetApp.openById(''); // Enter the ID for the Google Sheets used to record the tutor responses
let tutorResponses = tutorResponseSheet.getSheetByName(''); // Enter the Sheet Name for the sheet that stores the tutor responses (Such as "Sheet 1")

function initialiseData() {
  // Run the below code to create a trigger, then delete the commented code. 
  //ScriptApp.newTrigger('onFormSubmit').forForm(parentForm).onFormSubmit().create();
  let subjectSheets = tutorResponses.getRange('D1:R1').getValues();
  let pattern = "\\[(.*?)\\]"
  for (let x=0; x<subjectSheets[0].length; x++) {
    let subjName = subjectSheets[0][x].match(pattern)[1];
    subjectDictionary[subjName] = subjectSheets[0][x].split(" ")[5]; // Creates a dictionary where each subject is stored under a topic (Algebra 1, Algebra 2, etc stored under Math, US History, World History, etc stored under Social Studies)
  
    subjectArr.push(subjName)
  }

}

function onFormSubmit(e) {
  let nameInd = tutorResponses.getRange('C2:C').getValues();
  let emailTo = e.response.getRespondentEmail();   
  let arrs = e.response.getItemResponses()[0].getResponse();
  let subject = e.response.getItemResponses()[1].getResponse();

  for (let j=0; j<nameInd.length; j++) {
    if (nameInd[j][0]==arrs) {
      tutorResponses.deleteRow(j+2);
      break;
    }
  }
  let items = parentForm.getItems();

  let store=null;
  let holder = null;
  let flag1=true;
  let flag2=true;

  for (let z=0; z<items.length;z++) {
    let item = items[z]
    if (flag1&&item.getType()=='MULTIPLE_CHOICE') {
      store=items[z];
      flag1=false
    }
    if (flag2&&item.getType()=='SECTION_HEADER') {
      if (arrs==item.getTitle().match(/Tutor Name:\s*(.+?)\s*\|/)[1]) {
        holder=item;
        flag2=false;
      }
    }

    if (item.getType() == 'PAGE_BREAK'){
      if (item.getTitle()==`Tutor Selected: ${arrs}`) {
        const mc = store.asMultipleChoiceItem();
        const choices = mc.getChoices().filter((choice)=>choice.getValue()!=arrs)
        mc.setChoices(choices);
        parentForm.deleteItem(item) // Deletes the Page break
        parentForm.deleteItem(items[z+1]) // Deletes the MCQ associated with the page break, since it will always be one ahead.
        parentForm.deleteItem(holder) // Deletes the section header
        break;
      }
    }
  }
  sendMail(arrs, subject, emailTo)
}


function sendMail(name, selectSubject, emails) {
 // MailApp.sendEmail(`${tutee},${tutor}`,'NHS Tutoring Match','Thank you for reaching out to the NHS Tutoring Program.\nYou were requested by a parent/teacher to tutor a student. Idk what else to write')
  MailApp.sendEmail('tgeorgelearning@gmail.com,' + emails,'test',`${name} is teaching ${selectSubject}`)
}

function updateParentForm () {
  initialiseData();
  let items = parentForm.getItems();
  items.forEach(item => {
    if (item.getType() == 'SECTION_HEADER') {
      existingNames.push(item.getTitle().match(/Tutor Name:\s*(.+?)\s*\|/)[1]);
    }
  });
  fillFormData()
}

function fillFormData() {
  let tutorVals = tutorResponses.getRange('B2:R').getValues()
  let allSubj=[];

  for (let i=0; i<tutorVals.length; i++) {
    let individualSubj=[];
    let helpText="";
    let currSubj="";

    if (tutorVals[i][0]==='') {
      break;
    }
    for (let z=2; z<tutorVals[i].length;z++) {
      if (tutorVals[i][z].length>0) {
        if (currSubj!=subjectDictionary[subjectArr[z-2]]) {
          currSubj=subjectDictionary[subjectArr[z-2]]
          helpText+=`\n\n${currSubj} : `;
        } 
        helpText+=`${subjectArr[z-2]} (${tutorVals[i][z]}), `
        individualSubj.push(`${subjectArr[z-2]} (${tutorVals[i][z]})`)
      }
    }

    if (helpText.length!=0) {
      allSubj.push(individualSubj)
      if (existingNames.includes(tutorVals[i][1])) {
        continue;
      }
      let tutorDisplay = parentForm.addSectionHeaderItem().setTitle(`Tutor Name: ${tutorVals[i][1]} | ${tutorVals[i][0]}`).setHelpText(helpText)
      parentForm.moveItem(tutorDisplay.getIndex(),0)
    } else {
      break;
    }
  }


  let currOptions =[];
  let mcq;
  let arr = parentForm.getItems()

  for (let z=0; z<arr.length; z++) {
    if (arr[z].getTitle() ==='Select'){
      mcq = arr[z].asMultipleChoiceItem();
    currOptions=mcq.getChoices();
    }
  }


  for (let h=0; h<tutorVals.length; h++) {
    if (tutorVals[h][1].length<1) {
      break;
    }
    if (existingNames.includes(tutorVals[h][1])){
      continue;
    }
    
    let tutorSelectPage = parentForm.addPageBreakItem().setTitle(`Tutor Selected: ${tutorVals[h][1]}`).setHelpText("Select below the subjects you want this tutor to tutor your child in!").setGoToPage(FormApp.PageNavigationType.SUBMIT);
    let tutorSelectMCQ = parentForm.addCheckboxItem()
    tutorSelectMCQ.setChoiceValues(allSubj[h])
    let option = mcq.createChoice(tutorVals[h][1],tutorSelectPage)
    currOptions.push(option)
  }

  mcq.setChoices(currOptions)
}

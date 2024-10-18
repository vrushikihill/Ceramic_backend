export const createTask = (
  appURL: string,
  adminName: string,
  organizationId?: string,
  surveyId?: string,
  appraisalId?: string,
) => {
  return `
   <div style=" display: flex; justify-content: center">
      <div style="border: 2px solid black; ">
      <div
          style="
            background-color: #7355b7;
            text-align: center;
            border-bottom: 2px solid black;
          "
        >
          <h1
            style="margin: 0; color: white; font-size: 2rem; padding: 5px 0"
          >
            Review Genie
          </h1>
      </div>
      <div style="padding: 10px">
        <p style="margin: 20px 0 0 0">Hello ${adminName}</p>
        <p style="margin: 20px 0 0 0">
        You are invited to complete a performance appraisal on ${adminName}.
        </p>
        <p style="margin: 20px 0 0 0">To proceed,click here :</p>
        <a href="${appURL}/${
          surveyId ? 'surveys' : 'appraisal-response'
        }/${organizationId}/${surveyId ? surveyId : appraisalId}">Go to task</a>
        <p style="margin: 20px 0 0 0">Thank you!</p>
      </div> 
    </div> 
    </div>
  `;
};

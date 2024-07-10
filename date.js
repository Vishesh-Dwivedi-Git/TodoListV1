exports.getDate=function(){
const today=new Date();
 const options={
    weekday:"long",
    day:"numeric",
    month:"long"
 };
 return today.toLocaleDateString("hin-IN",options );
}
exports.getDay=function(){
    const today=new Date();
     const options={
        weekday:"long"
     };
     return today.toLocaleDateString("hin-IN",options );
    
    }
// Directly using exports instead of modeule.export and different way of declaring function in JS.
// change the keyword to const from var.
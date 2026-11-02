function printSettings(type='journal'){
 if(!['week','lesson','journal','sequence','project'].includes(type))throw Error('Type de document non autorisé');
 return{silent:false,printBackground:true,landscape:['week','sequence','project'].includes(type),pageSize:'A4',margins:{marginType:'none'}};
}
module.exports={printSettings};

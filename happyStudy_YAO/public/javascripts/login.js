function CheckForm()
{  
	if   (!document.login.username.value)   {  
		alert("請輸入您的帳號!");
		document.login.username.focus();
		return   false;
	}else if (!document.login.password.value){
		alert("請輸入您的密碼!");
		document.login.password.focus();
		return   false;
	}
	return   true;
}

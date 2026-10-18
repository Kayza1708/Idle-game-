/** The HTML shell paints before the game bundle is fetched or evaluated. */
void import('./main').catch(()=>{
 const shell=document.querySelector('.loading-screen'),status=shell?.querySelector('.loading-screen__status');
 if(!shell||!status)return;
 shell.classList.add('is-failed');
 status.textContent='Das Spiel konnte nicht geladen werden. Bitte versuche es erneut.';
 const retry=document.createElement('button');retry.type='button';retry.className='loading-screen__retry';retry.textContent='Erneut laden';
 retry.addEventListener('click',()=>location.reload());status.after(retry);
});

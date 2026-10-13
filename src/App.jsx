import React, { useEffect, useMemo, useState } from 'react';
import { supabase, isSupabaseConfigured } from './lib/supabase.js';
import { Activity, ArrowDownRight, ArrowLeft, ArrowUpRight, Bell, Bookmark, Camera, Check, ChevronDown, CircleHelp, Compass, Copy, Flame, Heart, Home, ImagePlus, MessageCircle, MoreHorizontal, Pencil, Plus, Search, Send, Settings, ShieldCheck, Sparkles, Trash2, TrendingUp, UserRound, X } from 'lucide-react';

const initialPosts = [
  { id: 1, user: 'milo.jpg', handle: '@milo_unfiltered', time: '12 min ago', tag: 'PURE CHAOS', title: 'the front camera humbled me so hard 💀', body: 'opened it by accident and saw 14 generations of bad decisions. anyway good morning besties', avatar: '🧌', color: 'lavender', likes: 284, comments: 32, image: '📸', liked: false, saved: false },
  { id: 2, user: 'toast.exe', handle: '@toast.exe', time: '38 min ago', tag: 'CERTIFIED MOMENT', title: 'my hair has its own weather system today', body: 'humidity: 1  |  my hair: final boss unlocked', avatar: '🍞', color: 'pink', likes: 196, comments: 18, image: '🌪️', liked: false, saved: false },
  { id: 3, user: 'pixelgremlin', handle: '@pixelgremlin', time: '1 hr ago', tag: 'NO CONTEXT', title: 'why does this look like a side quest npc', body: 'i cannot explain this. i will not be taking questions.', avatar: '👾', color: 'blue', likes: 143, comments: 11, image: '🫠', liked: false, saved: false },
];

const nav = [
  { label: 'Home', icon: Home }, { label: 'Explore', icon: Compass }, { label: 'Create', icon: Plus }, { label: 'Messages', icon: MessageCircle }, { label: 'Profile', icon: UserRound },
];

function Brand() { return <a className="brand" href="#home" aria-label="OnlyUgly home"><img className="brand-mark-image" src="/favicon.svg" alt="" /><span>only<span className="brand-accent">ugly</span><small>UNFILTERED BY NATURE</small></span></a>; }

function AuthPanel({ onAuthChange }) {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const submit = async e => {
    e.preventDefault();
    if (!isSupabaseConfigured) { setMessage('Supabase connection is not ready. Check the Vercel environment variables.'); return; }
    if (mode === 'signup' && password !== confirmPassword) { setMessage('Those passwords do not match.'); return; }
    if (mode === 'signup' && !/^[a-zA-Z0-9_]{3,20}$/.test(username)) { setMessage('Username must be 3–20 characters: letters, numbers, or underscores.'); return; }
    setBusy(true); setMessage('');
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { display_name: displayName.trim(), username: username.trim().toLowerCase() }, emailRedirectTo: window.location.origin } });
        if (error) throw error;
        if (data.session) onAuthChange(data.session.user);
        else setMessage('Account created! Check your email to confirm it, then sign in.');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        onAuthChange(data.user);
      }
    } catch (err) { setMessage(err.message || 'Authentication failed. Please try again.'); }
    finally { setBusy(false); }
  };
  const oauth = async provider => {
    if (!isSupabaseConfigured) { setMessage('Supabase is not connected yet.'); return; }
    setBusy(true); setMessage('');
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin } });
    if (error) { setMessage(error.message || provider + ' sign-in could not start.'); setBusy(false); }
  };
  return <main className="auth-screen">
    <div className="auth-aurora aurora-one"/><div className="auth-aurora aurora-two"/><div className="auth-aurora aurora-three"/>
    <div className="auth-stars" aria-hidden="true">{Array.from({length:22},(_,i)=><i key={i} style={{'--i':i}}/>)}</div>
    <section className="auth-showcase">
      <div className="auth-brand-lockup"><img src="/favicon.svg" alt="OnlyUgly logo"/><div className="auth-brand-word">only<span>ugly</span></div><small>UNFILTERED BY NATURE</small></div>
      <div className="auth-manifesto"><span className="auth-overline"><Sparkles size={15}/> YOUR PEOPLE. YOUR CHAOS.</span><h1>Perfect is<br/><span>overrated.</span></h1><p>A home for the moments that make you human. No pressure to be polished. Just be you.</p>
        <div className="auth-orbit orbit-a"/><div className="auth-orbit orbit-b"/><div className="auth-orbit orbit-c"/><div className="auth-floating-chip chip-a">✦ 100% unfiltered</div><div className="auth-floating-chip chip-b">no judgement zone</div>
      </div><div className="auth-footnote"><span className="auth-live-dot"/> A little less perfect. A lot more real.</div>
    </section>
    <section className="auth-card" aria-labelledby="auth-title"><div className="auth-card-top"><span className="auth-mini-logo">OU</span><span className="auth-step">{mode === 'signin' ? 'WELCOME BACK' : 'YOUR NEXT CHAPTER'}</span></div>
      <h2 id="auth-title">{mode === 'signin' ? 'Enter your world.' : 'Find your people.'}</h2><p className="auth-card-sub">{mode === 'signin' ? 'Your unfiltered corner is waiting.' : 'Make an account. Bring your whole self.'}</p>
      <div className="auth-mode-tabs"><button type="button" className={mode === 'signin' ? 'selected' : ''} onClick={()=>{setMode('signin');setMessage('')}}>Log in</button><button type="button" className={mode === 'signup' ? 'selected' : ''} onClick={()=>{setMode('signup');setMessage('')}}>Create account</button></div>
      <form onSubmit={submit} className="auth-form">
        {mode === 'signup' && <><label className="field-label" htmlFor="auth-display-name">Display name</label><input id="auth-display-name" className="glass-input" autoComplete="name" required minLength={2} maxLength={40} value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="What should people call you?"/><label className="field-label" htmlFor="auth-username">Username</label><input id="auth-username" className="glass-input" autoComplete="username" required minLength={3} maxLength={20} pattern="[A-Za-z0-9_]+" value={username} onChange={e=>setUsername(e.target.value.replace(/\s/g,''))} placeholder="your_unique_name"/><small className="auth-help">3–20 letters, numbers or underscores</small></>}
        <label className="field-label" htmlFor="auth-email">Email address</label><input id="auth-email" className="glass-input" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/>
        <label className="field-label" htmlFor="auth-password">Password</label><input id="auth-password" className="glass-input" type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} minLength={6} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 6 characters"/>
        {mode === 'signup' && <><label className="field-label" htmlFor="auth-confirm-password">Confirm password</label><input id="auth-confirm-password" className="glass-input" type="password" autoComplete="new-password" minLength={6} required value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Type it again"/></>}
        {message && <p className="auth-message" role="status">{message}</p>}
        <button className="primary-btn auth-submit" type="submit" disabled={busy}>{busy ? 'One sec…' : mode === 'signin' ? 'Log in to OnlyUgly' : 'Create my account'} <ArrowUpRight size={17}/></button>
      </form>
      <div className="auth-divider"><span/>or continue with<span/></div>
      <div className="oauth-buttons"><button type="button" onClick={()=>oauth('google')} disabled={busy}><b className="google-g">G</b> Google</button><button type="button" onClick={()=>oauth('apple')} disabled={busy}><b className="apple-mark">●</b> Apple</button></div>
      <p className="auth-legal">Keep OnlyUgly a kind place. Laugh with people, never at them.</p>
      {!isSupabaseConfigured && <p className="auth-message">Supabase connection is missing. Check the Vercel environment variables.</p>}
    </section>
  </main>;
}

function Avatar({ emoji, color = 'lavender', size = '', src = '' }) { return <div className={`avatar ${color} ${size}`}>{src ? <img src={src} alt=""/> : (emoji || <UserRound size={20} aria-hidden="true"/>)}</div>; }

function PostCard({post,currentUserId,onLike,onSave,onComment,onRate,onEdit,onDelete,onCopyLink}){
 const [ratingValue,setRatingValue]=useState(post.myRating ?? 5),[menu,setMenu]=useState(false),[idx,setIdx]=useState(0);
 const images=post.imageUrls?.length?post.imageUrls:(post.imageUrl?[post.imageUrl]:[]),owner=currentUserId===post.authorId;
 useEffect(()=>{if(!post.autoSwipe||images.length<2)return;const t=window.setInterval(()=>setIdx(i=>(i+1)%images.length),2000);return()=>window.clearInterval(t)},[post.autoSwipe,images.length]);
 return <article className="post-card" id={'post-'+post.id}><div className="post-top"><Avatar emoji={post.avatar} color={post.color}/><div className="post-author"><strong>{post.user}</strong><span>{post.handle} · {post.time}</span></div><div className="post-menu-wrap"><button className="icon-btn post-more" onClick={()=>setMenu(v=>!v)} aria-label="More post options"><MoreHorizontal size={20}/></button>{menu&&<div className="post-menu"><button onClick={()=>{onCopyLink(post.id);setMenu(false)}}><Copy size={15}/> Copy link</button><button onClick={()=>{onSave(post.id);setMenu(false)}}><Bookmark size={15}/> {post.saved?'Unsave':'Save post'}</button>{owner&&<><button onClick={()=>{onEdit(post);setMenu(false)}}><Pencil size={15}/> Edit</button><button onClick={()=>{onDelete(post);setMenu(false)}} className="danger-menu-item"><Trash2 size={15}/> Delete</button></>}</div>}</div></div><div className="post-tag"><span className="tag-dot"/>{post.tag}</div><h3>{post.title}</h3><p className="post-body">{post.body}</p>
 {images.length>0&&<div className="post-gallery"><img src={images[idx%images.length]} alt={'Post image '+(idx+1)}/>{images.length>1&&<><button className="gallery-arrow gallery-prev" onClick={()=>setIdx(i=>(i-1+images.length)%images.length)}>‹</button><button className="gallery-arrow gallery-next" onClick={()=>setIdx(i=>(i+1)%images.length)}>›</button><div className="gallery-dots">{images.map((_,dot)=><button key={dot} type="button" className={dot===idx?'gallery-dot active':'gallery-dot'} onClick={()=>setIdx(dot)} aria-label={'Show image '+(dot+1)}/>)}</div><span className="gallery-count">{idx+1}/{images.length}{post.autoSwipe?' · AUTO':''}</span></>}</div>}
 {post.vibeEmoji&&<div className="post-art"><span className="art-stamp">UNFILTERED MOMENT</span><span className="art-emoji">{post.vibeEmoji}</span><span className="art-caption">JUST VIBES</span></div>}
 {post.rating?.enabled&&<div className="rating-panel"><div className="rating-heading"><span className="rating-icon"><Activity size={16}/></span><div><strong>{post.rating.question}</strong><small>{post.rating.count||0} community ratings</small></div><span className="rating-value">{post.rating.average==null?'—':Number(post.rating.average).toFixed(1)}<small>/10 avg</small></span></div>{post.myRating!=null?<div className="rating-thanks"><Check size={15}/> You rated <strong>{post.myRating}/10</strong></div>:<><div className={post.gravityEngine?'rating-control gravity-enabled':'rating-control'}><input className="rating-slider" aria-label="Your rating out of 10" type="range" min="0" max="10" step="1" value={ratingValue} onChange={e=>setRatingValue(+e.target.value)} onPointerMove={e=>{if(post.gravityEngine&&e.buttons===1){const r=e.currentTarget.getBoundingClientRect();const x=(e.clientX-r.left)/r.width;const toward=post.gravityDirection==='left'?x<.5:x>=.5;if(toward)setRatingValue(post.gravityDirection==='left'?0:10)}}} onPointerUp={()=>{if(post.gravityEngine)setRatingValue(v=>post.gravityDirection==='left'?(v<5?0:v):(v>=5?v:10))}} onKeyUp={()=>{if(post.gravityEngine)setRatingValue(v=>post.gravityDirection==='left'?(v<5?0:v):(v>=5?v:10))}} style={{'--slider-progress':(ratingValue*10)+'%'}}/><output className="rating-selected-value">{ratingValue}<small>/10</small></output></div><div className="rating-submit-row"><div className="rating-labels"><span>{post.rating.minLabel||'Not at all'}</span><span>{post.rating.maxLabel||'Absolutely'}</span></div><button className="rating-vote-btn" onClick={()=>onRate(post.id,ratingValue)}><Check size={15}/> Rate it</button></div></>}</div>}
 <div className="post-stats"><span>{post.likes.toLocaleString()} reactions</span><span>{post.comments} comments</span></div><div className="post-actions"><button className={post.liked?'action active-like':'action'} onClick={()=>onLike(post.id)}><Heart size={18}/><span>{post.liked?'Loved it':'Relatable'}</span></button><button className="action" onClick={()=>onComment(post)}><MessageCircle size={18}/><span>Comment</span></button><button className={post.saved?'action active-save':'action'} onClick={()=>onSave(post.id)}><Bookmark size={18}/><span>{post.saved?'Saved':'Save'}</span></button></div></article>;
}

function CreateModal({onClose,onPost,onMoodNote,initialPost=null,pageMode=false}){
 const [caption,setCaption]=useState(initialPost?.title||''),[mood,setMood]=useState(initialPost?.tag||'PURE CHAOS'),[vibeOn,setVibeOn]=useState(!!initialPost?.vibeEmoji),[emoji,setEmoji]=useState(initialPost?.vibeEmoji||'🫠'),[customEmoji,setCustomEmoji]=useState(''),[ratingOn,setRatingOn]=useState(!!initialPost?.rating?.enabled),[question,setQuestion]=useState(initialPost?.rating?.question||'Rate the unfiltered energy'),[low,setLow]=useState(initialPost?.rating?.minLabel||'Not at all'),[high,setHigh]=useState(initialPost?.rating?.maxLabel||'Absolutely'),[autoSwipe,setAutoSwipe]=useState(initialPost?.autoSwipe!==false),[gravity,setGravity]=useState(initialPost?.gravityEngine!==false),[gravityDirection,setGravityDirection]=useState(initialPost?.gravityDirection||'right'),[files,setFiles]=useState([]),[removed,setRemoved]=useState([]),[busy,setBusy]=useState(false),[moodDuration,setMoodDuration]=useState(12);
 const old=initialPost?.imageUrls||(initialPost?.imageUrl?[initialPost.imageUrl]:[]),kept=old.filter(x=>!removed.includes(x)),chosen=customEmoji.trim()||emoji,previews=files.map(f=>URL.createObjectURL(f));
 useEffect(()=>()=>previews.forEach(URL.revokeObjectURL),[files]);
 const submit=async()=>{setBusy(true);try{const ok=await onPost({caption:caption.trim(),mood,vibeEmoji:vibeOn?chosen:null,rating:{enabled:ratingOn,question:question.trim(),minLabel:low.trim(),maxLabel:high.trim()},files,imageUrls:kept,autoSwipe,gravityEngine:gravity,gravityDirection,editingPost:initialPost});if(ok!==false)onClose()}finally{setBusy(false)}};
 return <div className={pageMode?"create-page-view":"modal-backdrop"} onMouseDown={e=>!pageMode&&e.target===e.currentTarget&&!busy&&onClose()}><section className={pageMode?"create-page-inner create-page-composer":"modal create-modal-wide"} role={pageMode?undefined:"dialog"} aria-modal={pageMode?undefined:true}><div className="modal-head"><div><span className="eyebrow"><Sparkles size={14}/> YOUR MOMENT, YOUR RULES</span><h2>{initialPost?'Edit your moment.':'Post the unfiltered.'}</h2></div><button className="icon-btn" onClick={onClose}><X/></button></div><label className="field-label" htmlFor="caption">What's the moment?</label><textarea id="caption" className="caption-editor" value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Tell the internet what happened..." maxLength={1000}/><div className="field-meta"><span>Keep it real, keep it respectful.</span><span>{caption.length}/1000</span></div><label className="field-label">Pick a vibe</label><div className="mood-options">{['PURE CHAOS','NO CONTEXT','CERTIFIED MOMENT'].map(x=><button type="button" key={x} className={mood===x?'mood selected':'mood'} onClick={()=>setMood(x)}>{x}</button>)}</div>
 <section className="composer-section"><div className="composer-section-head"><div><strong><ImagePlus size={17}/> Images</strong><small>Multiple photos · 10 MB each</small></div><label className="upload-btn">＋ Add images<input type="file" multiple accept="image/*" onChange={e=>setFiles(v=>[...v,...Array.from(e.target.files||[]).filter(f=>f.type.startsWith('image/')).slice(0,10-v.length)])}/></label></div>{[...kept,...previews].length>0?<div className="composer-gallery">{[...kept,...previews].map((u,i)=><div className="composer-thumb" key={u}><img src={u} alt={'Image '+(i+1)}/><button type="button" onClick={()=>i<kept.length?setRemoved(v=>[...v,u]):setFiles(v=>v.filter((_,j)=>j!==i-kept.length))}><X size={14}/></button></div>)}</div>:<div className="upload-drop"><ImagePlus/><span>No images yet</span><small>You can post with just a vibe emoji.</small></div>}<div className="composer-toggles"><label className="checkline"><input type="checkbox" checked={autoSwipe} onChange={e=>setAutoSwipe(e.target.checked)}/> Auto-swipe images</label></div></section>
 <section className="composer-section mood-note-builder"><div className="composer-section-head"><div><strong><Sparkles size={17}/> Animated vibe card</strong><small>Separate from posts · disappears automatically</small></div><button type="button" role="switch" aria-checked={vibeOn} className={vibeOn?'toggle-switch on':'toggle-switch'} onClick={()=>setVibeOn(v=>!v)}><span/></button></div>{vibeOn&&<><div className="emoji-options">{['🫠','😭','🧌','🍞','👾','✨','🫡','🤡','😂','💀','🪿','🫨','🥹','😎','🌀','🔥'].map(x=><button type="button" key={x} className={emoji===x?'emoji selected':'emoji'} onClick={()=>setEmoji(x)}>{x}</button>)}</div><label className="field-label" htmlFor="custom-vibe-emoji">Custom emoji (optional)</label><input id="custom-vibe-emoji" className="glass-input" value={customEmoji} onChange={e=>setCustomEmoji(e.target.value)} maxLength={8} placeholder="Type or paste an emoji to replace the selected one"/><div className="mood-duration-options"><button type="button" className={moodDuration===12?'mood selected':'mood'} onClick={()=>setMoodDuration(12)}>12 hours</button><button type="button" className={moodDuration===24?'mood selected':'mood'} onClick={()=>setMoodDuration(24)}>24 hours</button></div><div className="mood-note-preview"><span>{chosen}</span><small>VIBE CARD · EXPIRES IN {moodDuration} HOURS</small></div><button type="button" className="secondary-btn mood-publish-btn" disabled={busy||!onMoodNote} onClick={async()=>{setBusy(true);try{const ok=await onMoodNote(chosen,moodDuration);if(ok){setVibeOn(false);onClose();}}finally{setBusy(false)}}}>Share vibe card <Send size={15}/></button></>}</section>
 <section className="rating-builder"><div className="rating-builder-head"><span className="rating-builder-icon"><Activity size={17}/></span><div><strong>Add a vibe slider</strong><small>Optional · community rating from 0–10</small></div><button type="button" role="switch" aria-checked={ratingOn} className={ratingOn?'toggle-switch on':'toggle-switch'} onClick={()=>setRatingOn(v=>!v)}><span/></button></div><label className="checkline gravity-toggle"><input type="checkbox" checked={gravity} onChange={e=>setGravity(e.target.checked)}/> Enable Gravity Engine™ <small>Magnetic rating slider</small></label>{gravity&&ratingOn&&<div className="gravity-direction"><span>Attract slider toward</span><button type="button" className={gravityDirection==='left'?'mood selected':'mood'} onClick={()=>setGravityDirection('left')}>← Left</button><button type="button" className={gravityDirection==='right'?'mood selected':'mood'} onClick={()=>setGravityDirection('right')}>Right →</button></div>}{ratingOn&&<div className="rating-builder-fields"><label className="field-label">What are people rating?</label><input className="glass-input" value={question} onChange={e=>setQuestion(e.target.value)} maxLength={70} placeholder="Rate the chaos"/><div className="rating-label-inputs"><label>Low end<input className="glass-input" value={low} onChange={e=>setLow(e.target.value)} maxLength={24}/></label><label>High end<input className="glass-input" value={high} onChange={e=>setHigh(e.target.value)} maxLength={24}/></label></div></div>}</section><button className="primary-btn publish-btn" disabled={busy||!caption.trim()||(ratingOn&&!question.trim())} onClick={submit}>{busy?'Publishing…':initialPost?'Save changes':'Share your moment'} <Send size={17}/></button><p className="tiny-note"><ShieldCheck size={14}/> Laugh with people, not at them.</p></section></div>;
}

export default function App() {
  const [authUser, setAuthUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [appTheme,setAppTheme] = useState('system');
  const [uploadQuality,setUploadQuality] = useState('hd');
  const [reduceMotion,setReduceMotion] = useState(false);
  const [settingsEmail,setSettingsEmail] = useState('');
  const [currentPassword,setCurrentPassword] = useState('');
  const [newPassword,setNewPassword] = useState('');
  const [profileName, setProfileName] = useState('');
  const [profileUsername, setProfileUsername] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [profileAvatarUrl, setProfileAvatarUrl] = useState('');
  const [followRows, setFollowRows] = useState([]);
  const [viewedProfile, setViewedProfile] = useState(null);
  useEffect(() => { if (!isSupabaseConfigured) { setAuthReady(true); return; } let alive=true; supabase.auth.getSession().then(({data})=>{if(alive){setAuthUser(data.session?.user ?? null);setAuthReady(true);}}).catch(()=>{if(alive)setAuthReady(true);}); const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{setAuthUser(session?.user ?? null);setAuthReady(true);}); return ()=>{alive=false;subscription.unsubscribe();}; }, []);
  useEffect(() => {
    if (!authUser?.id || !isSupabaseConfigured) return;
    let cancelled = false;
    supabase.from('profiles').select('display_name,username,bio,visibility,avatar_url').eq('id', authUser.id).maybeSingle().then(({data,error}) => {
      if (!cancelled && !error && data) {
        setProfileName(data.display_name || '');
        setProfileUsername(data.username || '');
        setProfileBio(data.bio || '');
        setProfileVisibility(data.visibility || 'public');
        setProfileAvatarUrl(data.avatar_url || '');
      }
    });
    return () => { cancelled = true; };
  }, [authUser?.id]);
  useEffect(() => {
    if (!authUser?.id || !isSupabaseConfigured) return;
    let alive = true;
    supabase.from('profiles').select('id,display_name,username,bio,avatar_url,visibility').order('display_name').then(({data,error}) => {
      if(alive && !error) setMessageProfiles((data||[]).filter(p=>p.id!==authUser.id));
    });
    const loadFollows = async () => { const {data,error}=await supabase.from('follows').select('follower_id,following_id,status'); if(alive&&!error)setFollowRows(data||[]); };
    loadFollows();
    const loadMessages = async () => {
      const {data,error}=await supabase.from('messages').select('*').or('sender_id.eq.'+authUser.id+',recipient_id.eq.'+authUser.id).order('created_at',{ascending:true}).limit(500);
      if(alive && !error) setMessageRows(data||[]);
      if(error) console.warn('Messages could not load:',error.message);
    };
    loadMessages();
    const channel=supabase.channel('onlyugly-messages-'+authUser.id).on('postgres_changes',{event:'*',schema:'public',table:'messages'},payload=>{
      const row=payload.new || payload.old;
      if(row && (row.sender_id===authUser.id || row.recipient_id===authUser.id)){
        if(payload.eventType==='INSERT') setMessageRows(current=>current.some(m=>m.id===row.id)?current:[...current,row].sort((a,b)=>new Date(a.created_at)-new Date(b.created_at)));
        if(payload.eventType==='UPDATE') setMessageRows(current=>current.map(m=>m.id===row.id?row:m));
      }
    }).on('postgres_changes',{event:'*',schema:'public',table:'mood_notes'},payload=>{const row=payload.new||payload.old;if(!row)return;if(payload.eventType==='DELETE'){setMoodNotes(current=>current.filter(n=>n.id!==row.id));return;}if(new Date(row.expires_at).getTime()>Date.now())setMoodNotes(current=>[row,...current.filter(n=>n.id!==row.id&&n.user_id!==row.user_id)]);}).subscribe();
    const loadMood=async()=>{
      const {data,error}=await supabase.from('mood_notes').select('id,user_id,emoji,created_at,expires_at').gt('expires_at',new Date().toISOString()).order('created_at',{ascending:false}).limit(100);
      if(alive&&!error){setMoodNotes(data||[]);setMoodNote((data||[]).find(n=>n.user_id===authUser.id)||null);}
    };
    loadMood();
    return ()=>{alive=false;supabase.removeChannel(channel);};
  },[authUser?.id]);
  useEffect(() => { const timer=window.setInterval(() => setMoodNotes(current=>current.filter(note=>new Date(note.expires_at).getTime()>Date.now())),30000); return () => window.clearInterval(timer); }, []);
  const [posts, setPosts] = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [activeNav, setActiveNav] = useState('Home');
  const [showCreate, setShowCreate] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [dockDrag, setDockDrag] = useState(false);
  const [dockPressed, setDockPressed] = useState(false);
  const [dockTargetIndex, setDockTargetIndex] = useState(0);
  const [dockOffset, setDockOffset] = useState(0);
  const [messageProfiles,setMessageProfiles] = useState([]);
  const [messageRows,setMessageRows] = useState([]);
  const [activeConversation,setActiveConversation] = useState(null);
  const [messageSearch,setMessageSearch] = useState('');
  const [messageDraft,setMessageDraft] = useState('');
  const [messageSending,setMessageSending] = useState(false);
  const [moodNote,setMoodNote] = useState(null);
  const [moodNotes,setMoodNotes] = useState([]);
  const [moodDuration,setMoodDuration] = useState(12);
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    const loadFeed = async () => {
      setFeedLoading(true);
      try {
        const { data: rows, error } = await supabase.from('posts').select('id,author_id,caption,mood,emoji,image_url,image_urls,auto_swipe,vibe_emoji,rating_enabled,rating_question,rating_min_label,rating_max_label,gravity_engine,gravity_direction,created_at').order('created_at', { ascending: false }).limit(50);
        if (error) throw error;
        const postRows = rows || [];
        const ids = postRows.map(p => p.id);
        const authorIds = [...new Set(postRows.map(p => p.author_id))];
        let profiles = [], reactions = [], saved = [], ratings = [];
        if (authorIds.length) {
          const profileResult = await supabase.from('profiles').select('id,display_name,username,bio').in('id', authorIds);
          if (profileResult.error) throw profileResult.error;
          profiles = profileResult.data || [];
        }
        if (ids.length) {
          const reactionResult = await supabase.from('reactions').select('post_id,user_id').in('post_id', ids);
          if (reactionResult.error) throw reactionResult.error;
          reactions = reactionResult.data || [];
          if (authUser?.id) {
            const savedResult = await supabase.from('saved_posts').select('post_id').eq('user_id', authUser.id).in('post_id', ids);
            if (savedResult.error) throw savedResult.error;
            saved = savedResult.data || [];
          }
          const ratingResult = await supabase.from('post_ratings').select('post_id,user_id,score').in('post_id', ids);
          if (ratingResult.error) throw ratingResult.error;
          ratings = ratingResult.data || [];
        }
        const mapped = postRows.map(p => {
          const profile = profiles.find(x => x.id === p.author_id) || {};
          const postReactions = reactions.filter(x => x.post_id === p.id);
          const postRatings = ratings.filter(x => x.post_id === p.id);
          const ratingAverage = postRatings.length ? postRatings.reduce((sum, x) => sum + x.score, 0) / postRatings.length : null;
          return { id:p.id, dbPost:true, authorId:p.author_id, user:profile.display_name || 'unfiltered human', handle:'@'+(profile.username || 'unfiltered'), time:new Date(p.created_at).toLocaleString(), tag:p.mood || 'PURE CHAOS', title:p.caption, body:'Posted with zero filters and maximum personality.', avatar:p.vibe_emoji || p.emoji || '🫠', color:'lavender', likes:postReactions.length, comments:0, image:p.vibe_emoji || p.emoji || '🫠', imageUrl:p.image_url, imageUrls:p.image_urls || (p.image_url ? [p.image_url] : []), vibeEmoji:p.vibe_emoji, autoSwipe:p.auto_swipe !== false, gravityEngine:p.gravity_engine !== false,gravityDirection:p.gravity_direction || 'right', liked:!!authUser?.id && postReactions.some(x => x.user_id === authUser.id), saved:saved.some(x => x.post_id === p.id), myRating:postRatings.find(x => x.user_id === authUser?.id)?.score ?? null, rating:p.rating_enabled ? {enabled:true,question:p.rating_question || 'Rate the vibe',minLabel:p.rating_min_label,maxLabel:p.rating_max_label,average:ratingAverage,count:postRatings.length} : null };
        });
        if (!cancelled) setPosts(mapped);
      } catch (err) {
        console.error('OnlyUgly feed could not load:', err);
        if (!cancelled) notify('Live feed error: ' + (err.message || 'please check Supabase permissions'));
      } finally { if (!cancelled) setFeedLoading(false); }
    };
    loadFeed();
    const feedChannel=supabase.channel('onlyugly-feed-'+authUser?.id).on('postgres_changes',{event:'*',schema:'public',table:'posts'},()=>{if(!cancelled)loadFeed();}).subscribe();
    return () => { cancelled = true; supabase.removeChannel(feedChannel); };
  }, [authUser?.id]);

  useEffect(() => {
    if(!authUser?.id||!activeConversation||!isSupabaseConfigured)return;
    const unread=messageRows.filter(m=>m.sender_id===activeConversation&&m.recipient_id===authUser.id&&!m.read_at);
    if(!unread.length)return;
    const ids=unread.map(m=>m.id);
    supabase.from('messages').update({read_at:new Date().toISOString()}).in('id',ids).then(({error})=>{
      if(error)console.warn('Could not mark messages read:',error.message);
      else setMessageRows(rows=>rows.map(m=>ids.includes(m.id)?{...m,read_at:new Date().toISOString()}:m));
    });
  },[authUser?.id,activeConversation,messageRows]);
  const savedCount = posts.filter(p => p.saved).length;
  const visiblePosts = useMemo(() => posts.filter(p => {
    const matches = `${p.user} ${p.title} ${p.body} ${p.tag}`.toLowerCase().includes(query.toLowerCase());
    if (activeNav === 'Messages' || activeNav === 'Create') return false;
    if (activeNav === 'Saved') return matches && p.saved;
    if (activeNav === 'Trending' || activeNav === 'Explore') return matches && p.likes >= 0;
    if (activeNav === 'Profile') return matches && (p.authorId === authUser?.id || p.handle === '@you_unfiltered');
    return matches;
  }), [posts, query, activeNav, authUser?.id]);
  const notify = message => { setToast(message); window.setTimeout(() => setToast(''), 2400); };
  const togglePost = async (id, field) => {
    const post = posts.find(p => p.id === id);
    if (!post) return;
    if (post.dbPost) {
      if (!authUser) { setShowAuth(true); notify('Sign in to react or save posts.'); return; }
      const table = field === 'liked' ? 'reactions' : 'saved_posts';
      const key = field === 'liked' ? 'user_id' : 'user_id';
      const wasOn = post[field];
      setPosts(current => current.map(p => p.id === id ? { ...p, [field]: !wasOn, ...(field === 'liked' ? { likes:p.likes + (wasOn ? -1 : 1) } : {}) } : p));
      const result = wasOn
        ? await supabase.from(table).delete().eq('post_id', id).eq(key, authUser.id)
        : await supabase.from(table).insert({ post_id:id, [key]:authUser.id });
      if (result.error) {
        setPosts(current => current.map(p => p.id === id ? { ...p, [field]:wasOn, ...(field === 'liked' ? { likes:p.likes + (wasOn ? 1 : -1) } : {}) } : p));
        notify('Could not update that post: ' + result.error.message);
      } else if (field === 'liked' && !wasOn && post.authorId && post.authorId !== authUser.id) {
        const { error: notificationError } = await supabase.from('notifications').insert({ user_id:post.authorId, actor_id:authUser.id, post_id:id, kind:'reaction', message:(authUser.user_metadata?.display_name || 'Someone') + ' reacted to your post.' });
        if (notificationError) console.warn('Notification could not be created:', notificationError.message);
      }
      return;
    }
    setPosts(current => current.map(p => p.id === id ? { ...p, [field]: !p[field], ...(field === 'liked' ? { likes: p.likes + (p.liked ? -1 : 1) } : {}) } : p));
  };
  const publishMoodNote = async (emoji,duration=12) => {
    if(!authUser?.id||!isSupabaseConfigured){notify('Sign in to share a mood note.');return false;}
    const expiresAt=new Date(Date.now()+Math.min(24,Math.max(12,duration))*60*60*1000).toISOString();
    // user_id is unique: upsert replaces the current note instead of racing into a duplicate-key error.
    const {data,error}=await supabase.from('mood_notes').upsert(
      {user_id:authUser.id,emoji,expires_at:expiresAt,created_at:new Date().toISOString()},
      {onConflict:'user_id'}
    ).select('id,user_id,emoji,created_at,expires_at').single();
    if(error){notify('Mood note failed: '+error.message);return false;}
    setMoodNote(data);
    setMoodNotes(current=>[data,...current.filter(n=>n.user_id!==authUser.id)]);
    notify('Your vibe emoji is live!');
    return true;
  };
  const addPost = async ({caption,mood,vibeEmoji,rating,files=[],imageUrls=[],autoSwipe=true,gravityEngine=false,gravityDirection='right',editingPost=null}) => {
    if(!authUser?.id||!isSupabaseConfigured){notify('Sign in to publish a real post.');return false;}
    try {
      const urls=[...imageUrls];
      for(const file of files){
        if(file.size>10*1024*1024){notify('Each image must be 10 MB or smaller.');return false;}
        const path=authUser.id+'/'+crypto.randomUUID()+'-'+file.name.replace(/[^a-zA-Z0-9._-]/g,'_');
        const {error:uploadError}=await supabase.storage.from('onlyugly-posts').upload(path,file,{contentType:file.type,upsert:false});
        if(uploadError)throw uploadError;
        const {data:publicData}=supabase.storage.from('onlyugly-posts').getPublicUrl(path);urls.push(publicData.publicUrl);
      }
      const payload={author_id:authUser.id,caption:caption.trim(),mood,emoji:vibeEmoji||'🫠',vibe_emoji:vibeEmoji,image_urls:urls,image_url:urls[0]||null,auto_swipe:autoSwipe,gravity_engine:gravityEngine,gravity_direction:gravityDirection,rating_enabled:!!rating?.enabled,rating_question:rating?.question||null,rating_min_label:rating?.minLabel||'Not at all',rating_max_label:rating?.maxLabel||'Absolutely',updated_at:new Date().toISOString()};
      let result;
      if(editingPost){result=await supabase.from('posts').update(payload).eq('id',editingPost.id).eq('author_id',authUser.id).select('id').single();}
      else result=await supabase.from('posts').insert(payload).select('id').single();
      if(result.error)throw result.error;
      const {data:profile}=await supabase.from('profiles').select('display_name,username').eq('id',authUser.id).maybeSingle();
      const postId=editingPost?.id||result.data.id;
      const mapped={id:postId,dbPost:true,authorId:authUser.id,user:profile?.display_name||authUser.user_metadata?.display_name||'you',handle:'@'+(profile?.username||authUser.user_metadata?.username||'you'),time:'just now',tag:mood,title:caption,body:'Posted with zero filters and maximum personality.',avatar:vibeEmoji||'🫠',color:'lavender',likes:editingPost?.likes||0,comments:editingPost?.comments||0,image:vibeEmoji||'🫠',imageUrl:urls[0]||null,imageUrls:urls,vibeEmoji,autoSwipe,gravityEngine,liked:editingPost?.liked||false,saved:editingPost?.saved||false,rating:rating?.enabled?{enabled:true,question:rating.question,minLabel:rating.minLabel,maxLabel:rating.maxLabel,average:null,count:0}:null};
      setPosts(current=>editingPost?current.map(p=>p.id===postId?{...p,...mapped}:p):[mapped,...current]);
      setEditingPost(null);setActiveNav('Home');setQuery('');notify(editingPost?'Post updated!':'Your moment is live!');return true;
    } catch(err){console.error('Post save failed:',err);notify('Post failed: '+(err.message||'check database/storage setup'));return false;}
  };
  const ratePost=async(id,score)=>{
    if(!authUser?.id){notify('Sign in to rate this post.');return;}
    const {error}=await supabase.from('post_ratings').upsert({post_id:id,user_id:authUser.id,score,updated_at:new Date().toISOString()},{onConflict:'post_id,user_id'});
    if(error){notify('Could not submit rating: '+error.message);return;}
    const {data}=await supabase.from('post_ratings').select('score').eq('post_id',id);
    const rows=data||[],avg=rows.length?rows.reduce((n,r)=>n+r.score,0)/rows.length:null;
    setPosts(v=>v.map(p=>p.id===id?{...p,myRating:score,rating:{...p.rating,average:avg,count:rows.length}}:p));notify('Vibe rating submitted!');
  };
  const copyPostLink=async id=>{const url=window.location.origin+'/#post-'+id;try{await navigator.clipboard.writeText(url);notify('Post link copied!')}catch{notify(url)}};
  const deletePost=async post=>{if(!window.confirm('Delete this post permanently?'))return;const {error}=await supabase.from('posts').delete().eq('id',post.id).eq('author_id',authUser.id);if(error){notify('Delete failed: '+error.message);return;}setPosts(v=>v.filter(p=>p.id!==post.id));notify('Post deleted.')};



  return !authReady ? <main className="auth-loading" aria-label="Restoring session"><img className="auth-loading-logo" src="/favicon.svg" alt=""/><strong className="auth-loading-name">only<span>ugly</span></strong></main> : !authUser ? <AuthPanel onAuthChange={setAuthUser}/> : <div className={activeNav === 'Messages' && activeConversation ? 'app-shell chat-open' : 'app-shell'} id="home"><div className="ambient-sparkles" aria-hidden="true">{Array.from({length: 8}, (_, i) => <span key={i}/>)}</div>
    <aside className="sidebar"><Brand/><button className="mobile-search icon-btn" aria-label="Search"><Search/></button><div className="sidebar-profile"><Avatar emoji="🧌" color="lavender" src={profileAvatarUrl}/><div><strong>{profileName || 'your alter ego'}</strong><span>@you_unfiltered</span></div><ChevronDown size={16}/></div><div className="side-label">YOUR SPACE</div><nav className="main-nav">{nav.map(({label, icon: Icon}) => <button key={label} aria-label={label} title={label} className={activeNav === label ? 'nav-item active' : 'nav-item'} onClick={() => setActiveNav(label)}><Icon size={19}/><span>{label}</span></button>)}</nav><button className="primary-btn side-create" onClick={() => { setShowCreate(false); setActiveNav("Create"); }}><Plus size={18}/> Create a post</button><div className="side-bottom"><button className="nav-item" onClick={() => setShowGuidelines(true)}><ShieldCheck size={19}/><span>Community guidelines</span></button><button className="nav-item" onClick={() => { setActiveNav('Profile'); setShowEditProfile(true); }}><Settings size={19}/><span>Edit profile</span></button><div className="side-foot"><span className="online-dot"/> ALL FILTERS OFF <span>v0.1 preview</span></div></div></aside>
    <main className="main-content"><header className="topbar"><div className="mobile-brand">{activeNav === 'Messages' && activeConversation ? <button className="chat-top-avatar chat-back-button" aria-label="Back to chats" onClick={()=>setActiveConversation(null)}><ArrowLeft size={20}/></button> : <Brand/>}</div><div className={`search-wrap ${activeNav==='Home'?'brand-pill':''}`}>{activeNav === 'Home' ? <Brand/> : activeNav === 'Messages' && activeConversation ? <div className="chat-top-name"><strong>{messageProfiles.find(p=>p.id===activeConversation)?.display_name || 'Conversation'}</strong><small>@{messageProfiles.find(p=>p.id===activeConversation)?.username || 'unfiltered'}</small></div> : <><Search size={18}/><input aria-label={activeNav === 'Messages' ? "Search chats and users" : "Search posts and people"} value={query} onChange={e => setQuery(e.target.value)} placeholder={activeNav === 'Messages' ? "Search chats and users..." : "Search chaos, people, moments..."}/><kbd>⌘ K</kbd></>}</div><div className="top-actions">{activeNav === 'Messages' && activeConversation ? <button className="icon-btn chat-profile-button" aria-label="View profile" onClick={()=>setViewedProfile(messageProfiles.find(p=>p.id===activeConversation)||null)}><UserRound size={20}/></button> : activeNav==='Profile' ? <button className="icon-btn" aria-label="Settings" title="Settings" onClick={()=>setShowSettings(true)}><Settings size={20}/></button> : <button className="icon-btn" aria-label="Notifications" onClick={async () => { setShowNotifications(true); const {data,error}=await supabase.from('notifications').select('id,kind,message,created_at,read_at').eq('user_id',authUser.id).order('created_at',{ascending:false}).limit(30); if(error) notify('Could not load notifications: '+error.message); else setNotifications(data||[]); }}><Bell size={20}/><i/></button>}}</div></header>
      <div className={"content-grid "+(["Create","Messages","Profile"].includes(activeNav)?"utility-page-grid":"")}><section className="feed-column">{!["Create","Messages","Profile"].includes(activeNav)&&<div className="welcome-row"><div><div className="eyebrow"><Sparkles className="gemini-sparkle" size={16}/> YOUR DAILY DOSE OF REAL</div><h1>{activeNav === 'Saved' ? 'Your saved chaos.' : (activeNav === 'Trending' || activeNav === 'Explore') ? 'Explore the chaos.' : activeNav === 'Profile' ? 'Your unfiltered era.' : <>It's giving <span>unfiltered.</span></>}</h1><p>{activeNav === 'Saved' ? 'Moments you wanted to keep close.' : activeNav === 'Profile' ? 'Your moments, your little corner of chaos.' : 'No perfect angles. No pretending. Just moments.'}</p></div><div className="date-pill"><span className="date-dot"/> THE INTERNET, UNFILTERED</div></div>}
      {activeNav === 'Home' && <section className="mood-note-rail" aria-label="Active mood notes"><div className="vibe-drop-rail-title">Vibe drops <small>Animated · expires in 12–24 hours</small></div><div className="mood-note-list">{moodNotes.filter(n=>new Date(n.expires_at).getTime()>Date.now()).map(n=>{const p=messageProfiles.find(x=>x.id===n.user_id);return <button key={n.id} className="vibe-drop-card" onClick={()=>{if(n.user_id!==authUser.id){setActiveNav('Messages');setActiveConversation(n.user_id);}}}><span className="mood-note-ring vibe-drop-emoji">{n.emoji}</span><small>{n.user_id===authUser.id?'You':p?.username||p?.display_name||'Member'}</small></button>})}</div></section>}
      {activeNav !== 'Trending' && activeNav !== 'Saved' && activeNav !== 'Messages' && activeNav !== 'Create' && <button className="composer" onClick={() => setShowCreate(true)}><Avatar emoji="🧌" color="lavender"/><span>What's your most unfiltered moment?</span><span className="composer-add"><ImagePlus size={17}/></span><span className="composer-cta">Post it <ArrowUpRight size={15}/></span></button>}
      {!["Create","Messages","Profile"].includes(activeNav)&&<div className="feed-heading"><div><h2>{activeNav === 'Saved' ? 'Saved moments' : (activeNav === 'Trending' || activeNav === 'Explore') ? 'Explore moments' : activeNav === 'Profile' ? 'Your posts' : 'The unfiltered feed'} <span className="live-pill"><i/> LIVE</span></h2><p>Real people. Ridiculous moments. Zero judgement.</p></div><button className="sort-btn" onClick={() => notify('Showing the latest preview posts.')}>Latest <ChevronDown size={15}/></button></div>}
      {activeNav === 'Create' && <CreateModal pageMode initialPost={null} onClose={() => setActiveNav('Home')} onPost={addPost} onMoodNote={publishMoodNote}/>}{activeNav === 'Messages' && <section className="messages-preview real-messages">{!activeConversation ? <><div className="messages-title"><div><span className="eyebrow"><MessageCircle size={15}/> PRIVATE MESSAGES</span><h2>Your messages</h2><p>Your conversations appear here.</p></div></div><div className="people-results">{query.trim()?messageProfiles.filter(p=>[p.display_name,p.username,p.bio].some(v=>(v||'').toLowerCase().includes(query.trim().replace(/^@/,'').toLowerCase()))).map(p=><button className="conversation-row chat-list-row search-person-row" key={p.id} onClick={()=>setViewedProfile(p)}><Avatar emoji="🫠" color="lavender" src={p.avatar_url}/><span className="conversation-copy"><strong>{p.display_name||'OnlyUgly member'} <small>@{p.username||'unfiltered'}</small></strong><span>{p.bio||'No bio yet'}</span></span><span className="chat-list-time">View profile →</span></button>):[...new Set(messageRows.flatMap(m=>[m.sender_id,m.recipient_id]).filter(id=>id&&id!==authUser?.id))].map(id=>{const p=messageProfiles.find(x=>x.id===id);if(!p)return null;const latest=messageRows.filter(m=>(m.sender_id===authUser.id&&m.recipient_id===id)||(m.sender_id===id&&m.recipient_id===authUser.id)).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))[0];return <button className="conversation-row chat-list-row" key={id} onClick={()=>setActiveConversation(id)}><Avatar emoji="🫠" color="lavender" src={p.avatar_url}/><span className="conversation-copy"><strong>{p.display_name||'OnlyUgly member'} <small>@{p.username||'unfiltered'}</small></strong><span>{latest?.body||'Open conversation'}</span></span><span className="chat-list-time">{latest?new Date(latest.created_at).toLocaleDateString([], {month:'short',day:'numeric'}):''}</span></button>})}</div>{query.trim()?null:messageRows.length===0&&<div className="empty-chat-state"><MessageCircle size={28}/><h3>No conversations yet</h3><p>Search for people using the top search bar to view their profile, follow them, or start a chat.</p></div>}</> : <><div className="chat-scroll" role="log" aria-live="polite">{messageRows.filter(m=>(m.sender_id===authUser?.id&&m.recipient_id===activeConversation)||(m.sender_id===activeConversation&&m.recipient_id===authUser?.id)).map((m,i,arr)=>{const day=new Date(m.created_at).toLocaleDateString([], {weekday:'short',month:'short',day:'numeric',year:'numeric'});const prev=i?new Date(arr[i-1].created_at).toLocaleDateString([], {weekday:'short',month:'short',day:'numeric',year:'numeric'}):null;return <React.Fragment key={m.id}>{day!==prev&&<div className="chat-date-divider"><span>{day}</span></div>}<div className={m.sender_id===authUser?.id?'chat-bubble mine':'chat-bubble theirs'}><span>{m.body}</span><small>{new Date(m.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}{m.sender_id===authUser?.id&&m.read_at?' · Read':''}</small></div></React.Fragment>})}</div><form className="chat-compose" onSubmit={async e=>{e.preventDefault();const body=messageDraft.trim();if(!body||messageSending)return;setMessageSending(true);const {data,error}=await supabase.from('messages').insert({sender_id:authUser.id,recipient_id:activeConversation,body}).select('*').single();setMessageSending(false);if(error){notify('Message failed: '+error.message);return;}setMessageRows(v=>[...v,data]);setMessageDraft('');}}><input value={messageDraft} onChange={e=>setMessageDraft(e.target.value)} placeholder="Write a message…" maxLength={4000}/><button className="primary-btn" disabled={!messageDraft.trim()||messageSending} type="submit"><Send size={16}/></button></form></>}</section>}{activeNav === 'Profile' && <section className="profile-hero"><div className="profile-cover"/><div className="profile-identity"><Avatar emoji="🧌" color="lavender" size="large" src={profileAvatarUrl}/><div><h2>{profileName || authUser.user_metadata?.display_name || authUser.email?.split('@')[0] || 'Your profile'}</h2><span>@{profileUsername || authUser.user_metadata?.username || 'unfiltered'}</span><p>{profileBio || 'Your corner of the internet. Keep it unfiltered. ✨'}</p></div><button className="secondary-btn" onClick={async () => { const {data}=await supabase.from('profiles').select('display_name,username,bio').eq('id',authUser.id).maybeSingle(); setProfileName(data?.display_name || authUser.user_metadata?.display_name || ''); setProfileUsername(data?.username || authUser.user_metadata?.username || ''); setProfileBio(data?.bio || ''); setProfileVisibility(data?.visibility || 'public'); setProfileAvatarUrl(data?.avatar_url || ''); setShowEditProfile(true); }}>Edit profile</button><button className="secondary-btn" onClick={async () => { const {error}=await supabase.auth.signOut(); if(error)notify(error.message); else setAuthUser(null); }}>Sign out</button></div><div className="profile-metrics"><div><strong>{posts.filter(p => p.authorId === authUser?.id || p.handle === '@you_unfiltered').length}</strong><span>posts</span></div><div><strong>{posts.filter(p => p.authorId === authUser?.id || p.handle === '@you_unfiltered').reduce((n,p)=>n+p.likes,0)}</strong><span>reactions</span></div><div><strong>{savedCount}</strong><span>saved</span></div></div></section>}{activeNav==='Explore'&&query.trim()&&<section className="explore-people"><div className="rail-title"><h3>People</h3><span>{messageProfiles.filter(p=>[p.display_name,p.username,p.bio].some(v=>(v||'').toLowerCase().includes(query.trim().replace(/^@/,'').toLowerCase()))).length} results</span></div>{messageProfiles.filter(p=>[p.display_name,p.username,p.bio].some(v=>(v||'').toLowerCase().includes(query.trim().replace(/^@/,'').toLowerCase()))).map(p=><button className="explore-person-row" key={p.id} onClick={()=>setViewedProfile(p)}><Avatar emoji="🫠" src={p.avatar_url}/><span className="explore-person-copy"><strong>{p.display_name||'OnlyUgly member'}</strong><small>@{p.username||'unfiltered'}</small>{p.bio&&<span>{p.bio}</span>}</span><ArrowUpRight size={17}/></button>)}</section>}{!["Create","Messages"].includes(activeNav)&&<div className="posts-list">{feedLoading && <p className="tiny-note">Loading the live OnlyUgly feed…</p>}{visiblePosts.length ? visiblePosts.map(post => <PostCard key={post.id} post={post} currentUserId={authUser.id} onLike={id => togglePost(id, 'liked')} onSave={id => togglePost(id, 'saved')} onRate={ratePost} onEdit={p=>setEditingPost(p)} onDelete={deletePost} onCopyLink={copyPostLink} onComment={() => notify('Comments are coming in the next build.')}/>) : <div className="empty-state"><span>🫥</span><h3>{activeNav === 'Saved' ? 'Nothing saved. Yet.' : 'No chaos found.'}</h3><p>{activeNav === 'Saved' ? 'Tap Save on a post and it’ll show up here.' : 'Try another search or be the first to post.'}</p><button className="secondary-btn" onClick={() => { setQuery(''); setActiveNav('Home'); }}>Back to the feed</button></div>}</div>}<footer className="mobile-footer">ONLYUGLY © 2026 · MADE FOR THE UNFILTERED</footer></section>
      <aside className="right-rail"><section className="promo-card"><div className="promo-orb orb-one"/><div className="promo-orb orb-two"/><span className="promo-kicker"><Sparkles size={13}/> THE ONLY RULE</span><h2>Perfect is<br/><span>boring.</span></h2><p>Your weird is welcome here. Bring the chaos, leave the judgement.</p><button onClick={() => setShowGuidelines(true)}>Our little manifesto <ArrowUpRight size={15}/></button><div className="promo-foot"><span>NO FILTERS</span><span>NO SHAME</span><span>JUST VIBES</span></div></section>
      <section className="rail-card trend-card"><div className="rail-title"><h3><Flame size={17}/> The vibe check</h3><span className="live-pill"><i/> NOW</span></div>{[{n:'01',tag:'#FrontCameraBetrayal',desc:'Everyone has been there',delta:'+28%'},{n:'02',tag:'#HairHasNoPlan',desc:'Humidity is the villain',delta:'+16%'},{n:'03',tag:'#NoContextNeeded',desc:'Explain nothing',delta:'+12%'}].map(t => <button className="trend-row" key={t.n} onClick={() => { setQuery(t.tag.slice(1).replace(/([A-Z])/g,' $1').trim()); setActiveNav('Explore'); }}><span className="trend-number">{t.n}</span><span className="trend-info"><strong>{t.tag}</strong><small>{t.desc}</small></span><span className="trend-delta"><ArrowUpRight size={13}/>{t.delta}</span></button>)}<div className="rail-footnote">Demo trends · not live platform data</div></section>
      <section className="rail-card community-card"><div className="community-icon"><ShieldCheck size={20}/></div><div><h3>Keep it kind, okay?</h3><p>Laugh with people, not at them. Share your own moments or get clear permission first.</p><button onClick={() => setShowGuidelines(true)}>Read community rules <ArrowUpRight size={14}/></button></div></section>
      <div className="rail-links"><a href="#home" onClick={e => {e.preventDefault(); setShowGuidelines(true);}}>Guidelines</a><a href="#home" onClick={e => {e.preventDefault(); notify('Privacy details will be added before launch.');}}>Privacy</a><a href="#home" onClick={e => {e.preventDefault(); notify('Help centre coming soon.');}}>Help</a><span>© 2026 OnlyUgly</span></div></aside></div></main>
    <nav className={`mobile-dock ${dockDrag?'dock-dragging':''}`} aria-label="Primary navigation" onPointerDown={e=>{const el=e.currentTarget;const r=el.getBoundingClientRect();const pill=el.querySelector(".dock-active-pill");const w=pill?.getBoundingClientRect().width||r.width/5;const maxX=Math.max(0,r.width-w-8);const x=Math.max(0,Math.min(maxX,e.clientX-r.left-w/2));el.style.setProperty("--drag-x",`${x}px`);setDockTargetIndex(Math.max(0,Math.min(4,Math.floor((x+w/2+4)/(r.width/5)))));setDockDrag(true);el.setPointerCapture?.(e.pointerId);}} onPointerMove={e=>{if(!dockDrag)return;const el=e.currentTarget;const r=el.getBoundingClientRect();const pill=el.querySelector(".dock-active-pill");const w=pill?.getBoundingClientRect().width||r.width/5;const maxX=Math.max(0,r.width-w-8);const x=Math.max(0,Math.min(maxX,e.clientX-r.left-w/2));el.style.setProperty("--drag-x",`${x}px`);setDockTargetIndex(Math.max(0,Math.min(4,Math.floor((x+w/2+4)/(r.width/5)))));}} onPointerUp={e=>{if(dockDrag){const el=e.currentTarget;const r=el.getBoundingClientRect();const pill=el.querySelector(".dock-active-pill");const w=pill?.getBoundingClientRect().width||r.width/5;const maxX=Math.max(0,r.width-w-8);const x=Math.max(0,Math.min(maxX,e.clientX-r.left-w/2));const index=Math.max(0,Math.min(4,Math.floor((x+w/2+4)/(r.width/5))));const target=nav[index]?.label;if(target){setActiveNav(target);setShowCreate(false);setEditingPost(null);}setDockDrag(false);}}} onPointerCancel={()=>setDockDrag(false)}><span className="dock-active-pill" style={{'--active-index':Math.max(0,nav.findIndex(n=>n.label===activeNav)),'--drag-index':dockTargetIndex}}/>{nav.map(({label,icon:Icon},index)=><button key={label} aria-label={label} title={label} className={`dock-item ${activeNav===label?'active':''} ${label==='Create'?'dock-create':''}`} onClick={()=>{setActiveNav(label);setShowCreate(false);setEditingPost(null);}}>{label==='Create'?<Plus size={22}/>:label==='Home'?<Home size={20}/>:label==='Trending'?<TrendingUp size={20}/>:label==='Messages'?<MessageCircle size={20}/>:<UserRound size={20}/>}</button>)}</nav>{(showCreate || editingPost) && <CreateModal initialPost={editingPost} onClose={() => {setShowCreate(false);setEditingPost(null)}} onPost={addPost}/>}
    {viewedProfile && <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setViewedProfile(null)}><section className="modal utility-modal viewed-profile-modal" role="dialog" aria-modal="true"><div className="modal-head"><div><span className="eyebrow"><UserRound size={14}/> MEMBER PROFILE</span><h2>{viewedProfile.display_name||'OnlyUgly member'}</h2></div><button className="icon-btn" onClick={()=>setViewedProfile(null)} aria-label="Close"><X/></button></div><div className="viewed-profile-identity"><Avatar emoji="🫠" src={viewedProfile.avatar_url}/><div><strong>@{viewedProfile.username||'unfiltered'}</strong><span>{viewedProfile.visibility==='private'?'Private profile':'Public profile'}</span></div></div><p className="viewed-profile-bio">{viewedProfile.bio||'No bio yet — just vibes. ✨'}</p><div className="viewed-profile-stats"><div><strong>{posts.filter(p=>p.authorId===viewedProfile.id).length}</strong><span>Posts</span></div><div><strong>{followRows.filter(f=>f.following_id===viewedProfile.id&&f.status==='accepted').length}</strong><span>Followers</span></div><div><strong>{followRows.filter(f=>f.follower_id===viewedProfile.id&&f.status==='accepted').length}</strong><span>Following</span></div></div><div className="viewed-profile-posts"><h3>Posts</h3>{posts.filter(p=>p.authorId===viewedProfile.id).length ? posts.filter(p=>p.authorId===viewedProfile.id).map(p=><button className="viewed-profile-post-row" key={p.id} onClick={()=>{setQuery('');setActiveNav('Explore');setViewedProfile(null);}}><span>{p.vibeEmoji||'✦'}</span><div><strong>{p.title||p.body||'Unfiltered moment'}</strong><small>{p.likes||0} reactions · {p.comments||0} comments</small></div><ArrowUpRight size={15}/></button>) : <p className="settings-note">No public posts to show yet.</p>}</div><div className="viewed-profile-actions"><button className="secondary-btn" onClick={()=>{setActiveNav('Messages');setActiveConversation(viewedProfile.id);setViewedProfile(null);}}>Message <MessageCircle size={15}/></button>{(()=>{const rel=followRows.find(f=>f.follower_id===authUser.id&&f.following_id===viewedProfile.id);const following=rel?.status==='accepted';return <button className="primary-btn" onClick={async()=>{if(rel){const {error}=await supabase.from('follows').delete().eq('follower_id',authUser.id).eq('following_id',viewedProfile.id);if(error){notify(error.message);return;}setFollowRows(v=>v.filter(x=>!(x.follower_id===authUser.id&&x.following_id===viewedProfile.id)));notify('Unfollowed.');}else{const status=viewedProfile.visibility==='private'?'pending':'accepted';const {data,error}=await supabase.from('follows').insert({follower_id:authUser.id,following_id:viewedProfile.id,status}).select().single();if(error){notify(error.message);return;}setFollowRows(v=>[...v,data]);notify(status==='pending'?'Follow request sent.':'Following!');}}}>{following?'Unfollow':rel?.status==='pending'?'Request pending':'Follow'}</button>})()}</div></section></div>}{showAuth && <AuthPanel user={authUser} onAuthChange={setAuthUser} onClose={() => setShowAuth(false)}/>}{showNotifications && <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setShowNotifications(false)}><section className="modal utility-modal" role="dialog" aria-modal="true"><div className="modal-head"><div><span className="eyebrow"><Bell size={14}/> YOUR ACTIVITY</span><h2>Notifications</h2></div><button className="icon-btn" onClick={()=>setShowNotifications(false)} aria-label="Close"><X/></button></div>{notifications.length ? notifications.map(n=><div className="notification-row" key={n.id}><span className="notification-dot"/><div><strong>{n.message}</strong><small>{new Date(n.created_at).toLocaleString()}</small></div></div>) : <div className="empty-state"><span>🔔</span><h3>You’re all caught up.</h3><p>Your notifications will show up here.</p></div>}</section></div>}
    {showSettings && <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setShowSettings(false)}><section className="modal utility-modal settings-modal" role="dialog" aria-modal="true"><div className="modal-head"><div><span className="eyebrow"><Settings size={14}/> ONLYUGLY PREFERENCES</span><h2>Settings</h2><p>Make your corner feel like yours.</p></div><button className="icon-btn" onClick={()=>setShowSettings(false)} aria-label="Close"><X/></button></div>
      <section className="settings-group"><h3>Account settings</h3><button className="settings-row" onClick={()=>{setShowSettings(false);setShowEditProfile(true);}}> <span><strong>Edit profile</strong><small>Name, username, bio and profile picture</small></span><ArrowUpRight size={17}/></button>
      <form className="settings-form" onSubmit={async e=>{e.preventDefault();if(!settingsEmail.trim())return;const {error}=await supabase.auth.updateUser({email:settingsEmail.trim()});if(error)notify('Email update failed: '+error.message);else{notify('Check your new email for a confirmation link.');setSettingsEmail('');}}}><label className="field-label">Change email</label><input className="glass-input" type="email" required placeholder={authUser?.email||'New email address'} value={settingsEmail} onChange={e=>setSettingsEmail(e.target.value)}/><button className="secondary-btn" type="submit">Update email</button></form>
      <div className="danger-zone"><strong>Danger Zone</strong><p>Account deletion permanently removes your account and associated content. This action needs a secure server-side deletion flow, so it isn't enabled in this screen yet.</p><button className="danger-btn" type="button" onClick={()=>notify('Account deletion is not enabled until secure deletion is configured.')}>Delete account</button></div></section>
      <section className="settings-group"><h3>Privacy &amp; security</h3><label className="field-label">Profile visibility</label><select className="glass-input" value={profileVisibility} onChange={async e=>{const v=e.target.value;setProfileVisibility(v);const {error}=await supabase.from('profiles').update({visibility:v,updated_at:new Date().toISOString()}).eq('id',authUser.id);if(error)notify('Visibility update failed: '+error.message);else notify('Profile visibility updated.');}}><option value="public">Public — anyone can see my profile</option><option value="private">Private — approve follow requests</option></select>
      <form className="settings-form" onSubmit={async e=>{e.preventDefault();if(!currentPassword||newPassword.length<8){notify('Enter your current password and a new password of at least 8 characters.');return;}const {error:verifyError}=await supabase.auth.signInWithPassword({email:authUser?.email||'',password:currentPassword});if(verifyError){notify('Current password is incorrect.');return;}const {error}=await supabase.auth.updateUser({password:newPassword});if(error)notify('Password update failed: '+error.message);else{notify('Password updated.');setCurrentPassword('');setNewPassword('');}}}><label className="field-label">Current password</label><input className="glass-input" type="password" autoComplete="current-password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} placeholder="Confirm your current password"/><label className="field-label">New password</label><input className="glass-input" type="password" autoComplete="new-password" minLength={8} value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="At least 8 characters"/><button className="secondary-btn" type="submit">Update password</button></form><p className="settings-note">Passkeys and recovery-key management need authentication-provider setup before they can be safely offered here.</p></section>
      <section className="settings-group"><h3>Your activity</h3><button className="settings-row" onClick={()=>{setShowSettings(false);setActiveNav('Profile');setQuery('');}}><span><strong>Your posts</strong><small>Browse your published moments</small></span><ArrowUpRight size={17}/></button><button className="settings-row" onClick={()=>{setShowSettings(false);setActiveNav('Saved');setQuery('');}}><span><strong>Saved posts</strong><small>Moments you've bookmarked</small></span><ArrowUpRight size={17}/></button><button className="settings-row" onClick={()=>{setShowSettings(false);setShowNotifications(true);}}><span><strong>Notifications</strong><small>Recent account activity</small></span><ArrowUpRight size={17}/></button><p className="settings-note">Reaction and comment history will be added when the activity views are connected to the live database.</p></section>
      <section className="settings-group"><h3>App settings</h3><label className="field-label">Theme</label><select className="glass-input" value={appTheme} onChange={e=>{setAppTheme(e.target.value);document.documentElement.dataset.theme=e.target.value;}}><option value="system">System default</option><option value="dark">Dark</option><option value="light">Light (preview)</option></select><label className="field-label">Image upload quality</label><select className="glass-input" value={uploadQuality} onChange={e=>setUploadQuality(e.target.value)}><option value="hd">HD quality</option><option value="data-saver">Data saver</option></select><label className="settings-check"><input type="checkbox" checked={reduceMotion} onChange={e=>{setReduceMotion(e.target.checked);document.documentElement.classList.toggle('reduce-motion',e.target.checked);}}/> Reduce animations and liquid-glass effects</label><p className="settings-note">Theme and upload quality are currently session preferences; persistent saving and upload compression will be wired in a follow-up.</p></section>
      </section></div>}
    {showEditProfile && <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setShowEditProfile(false)}><section className="modal utility-modal" role="dialog" aria-modal="true"><div className="modal-head"><div><span className="eyebrow"><Settings size={14}/> YOUR IDENTITY</span><h2>Edit profile</h2></div><button className="icon-btn" onClick={()=>setShowEditProfile(false)} aria-label="Close"><X/></button></div><form onSubmit={async e=>{e.preventDefault();const clean=profileUsername.trim().toLowerCase();if(!/^[a-z0-9_]{3,20}$/.test(clean)){notify('Username must be 3–20 letters, numbers or underscores.');return;}const {error}=await supabase.from('profiles').update({display_name:profileName.trim(),username:clean,bio:profileBio.trim(),avatar_url:profileAvatarUrl||null,updated_at:new Date().toISOString()}).eq('id',authUser.id);if(error){notify('Could not update profile: '+error.message);return;}const {error:metaError}=await supabase.auth.updateUser({data:{display_name:profileName.trim(),username:clean}});if(metaError)notify(metaError.message);setMessageProfiles(v=>v.map(p=>p.id===authUser.id?{...p,display_name:profileName.trim(),username:clean,avatar_url:profileAvatarUrl,visibility:profileVisibility}:p));notify('Profile updated!');setShowEditProfile(false);}}><div className="profile-avatar-editor"><Avatar src={profileAvatarUrl}/><div><label className="field-label" htmlFor="edit-avatar">Profile picture</label><input id="edit-avatar" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;if(file.size>5*1024*1024){notify('Profile pictures must be 5 MB or smaller.');return;}const ext=(file.name.split('.').pop()||'jpg').replace(/[^a-zA-Z0-9]/g,'');const path=authUser.id+'/profile-'+crypto.randomUUID()+'.'+ext;const {error}=await supabase.storage.from('onlyugly-posts').upload(path,file,{contentType:file.type,upsert:true});if(error){notify('Picture upload failed: '+error.message);return;}const {data}=supabase.storage.from('onlyugly-posts').getPublicUrl(path);setProfileAvatarUrl(data.publicUrl);notify('Picture uploaded. Save changes to apply it.');}}/><small>PNG, JPG or WebP · max 5 MB</small></div></div><label className="field-label" htmlFor="edit-display-name">Display name</label><input id="edit-display-name" className="glass-input" required maxLength={40} value={profileName} onChange={e=>setProfileName(e.target.value)}/><label className="field-label" htmlFor="edit-username">Username</label><input id="edit-username" className="glass-input" required minLength={3} maxLength={20} pattern="[A-Za-z0-9_]+" value={profileUsername} onChange={e=>setProfileUsername(e.target.value)}/><label className="field-label" htmlFor="edit-bio">Bio</label><textarea id="edit-bio" value={profileBio} maxLength={160} onChange={e=>setProfileBio(e.target.value)} placeholder="A little about your unfiltered self…"/><button className="primary-btn publish-btn" type="submit">Save changes</button></form></section></div>}
    {showGuidelines && <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setShowGuidelines(false)}><section className="modal guidelines-modal" role="dialog" aria-modal="true" aria-labelledby="rules-title"><div className="modal-head"><div><span className="eyebrow"><ShieldCheck size={14}/> THE ONLYUGLY MANIFESTO</span><h2 id="rules-title">Be unfiltered. Be decent.</h2></div><button className="icon-btn" onClick={() => setShowGuidelines(false)} aria-label="Close"><X/></button></div><div className="rule-list"><div><span>01</span><section><strong>Laugh with, not at.</strong><p>The joke should never be someone’s appearance, identity, or vulnerability.</p></section></div><div><span>02</span><section><strong>Your face, your choice.</strong><p>Post your own photos, or get clear permission before sharing someone else’s.</p></section></div><div><span>03</span><section><strong>No harassment. No pile-ons.</strong><p>Don't target, shame, threaten, or organize attacks against anyone.</p></section></div><div><span>04</span><section><strong>Keep private things private.</strong><p>Never post personal information, private chats, or images without consent.</p></section></div></div><button className="primary-btn publish-btn" onClick={() => setShowGuidelines(false)}><Check size={17}/> Got it</button></section></div>}
    {toast && <div className="toast"><span className="toast-check"><Check size={15}/></span>{toast}</div>}
  </div>;
}

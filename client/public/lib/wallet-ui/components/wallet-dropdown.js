import { p as proxyCustomElement, H as H$1, c as createEvent, h as h$2 } from './index.js';
import { E as Environment, g as getApiConfig, d as defineCustomElement$2 } from './p-FUsAEGQG.js';
import { o as oscilarService, i as initWalletEvents, l as trackApiCall, m as trackAddPaymentStarted, n as trackAddBankStarted, p as trackPaymentSelection } from './p-BIbnFGdR.js';
import { d as defineCustomElement$4 } from './p-CBiti814.js';
import { d as defineCustomElement$5 } from './p-CEQ7vRTX.js';
import { d as defineCustomElement$3 } from './p-Cd2Eytzd.js';

// Helper function to conditionally log only in development
const devLog = (environment, message, ...args) => {
    if (environment === Environment.LOCALDEVELOPMENT || environment === Environment.STAGING) {
        console.log(message, ...args);
    }
};
async function fetchPaymentOptions(operationsToken, userScopedAccessToken, paymentType = 'all', environment = Environment.PRODUCTION) {
    const apiConfig = getApiConfig(environment);
    const url = `${apiConfig.BASE_URL}${apiConfig.RELATIVE_URLS.FETCH_PAYMENT_OPTIONS}`; // Construct the full URL
    try {
        const response = await fetch(url, {
            method: 'GET', // Use GET for wallet endpoint
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${operationsToken}`, // Operations token
                'X-SW-API-KEY': userScopedAccessToken, // User scoped access token
            },
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch payment options: ${response.statusText}`);
        }
        const data = await response.json();
        devLog(environment, 'Fetched payment options:', data); // Debugging log
        const availableCreditCards = data.availableCreditCards ?? null;
        // Process the payment instruments to extract the required data with sorting
        const paymentOptions = data.paymentInstruments
            // Filter by payment type if specified
            .filter((instrument) => {
            if (paymentType === 'all') {
                return true;
            }
            else if (paymentType === 'card') {
                return instrument.paymentInstrumentType === 'Card';
            }
            return true;
        })
            .map((instrument) => {
            if (instrument.paymentInstrumentType === 'BankAccount') {
                return {
                    value: instrument.paymentInstrumentToken,
                    text: `${instrument.bankAccountType}: ${instrument.maskedAccountNumber}`,
                    type: `BankAccount-${instrument.bankAccountType}`,
                    sortOrder: 4 // Bank accounts come after cards
                };
            }
            else if (instrument.paymentInstrumentType === 'Card') {
                const cardType = instrument.cardProduct || 'Card';
                devLog(environment, '🔍 Raw card type from API:', cardType);
                // Normalize card type for consistent icon mapping
                let normalizedCardType = cardType.toLowerCase().trim().replace(/\s+/g, '');
                devLog(environment, '🔍 After initial normalization:', normalizedCardType);
                // Map common variations to standard names
                if (normalizedCardType.includes('visa')) {
                    normalizedCardType = 'visa';
                    devLog(environment, '✅ Matched as Visa');
                }
                else if (normalizedCardType.includes('master')) {
                    normalizedCardType = 'mastercard';
                    devLog(environment, '✅ Matched as Mastercard');
                }
                else if (normalizedCardType.includes('amex') || normalizedCardType.includes('americanexpress')) {
                    normalizedCardType = 'americanexpress';
                    devLog(environment, '✅ Matched as American Express');
                }
                else if (normalizedCardType.includes('discover')) {
                    normalizedCardType = 'discover';
                    devLog(environment, '✅ Matched as Discover');
                }
                else {
                    devLog(environment, '⚠️ No match found for card type, keeping as:', normalizedCardType);
                }
                devLog(environment, '🎯 Final normalized card type:', normalizedCardType);
                // Define sort order based on normalized card type
                let sortOrder = 5; // Default for other/unknown card types (will come after bank accounts)
                if (normalizedCardType === 'visa') {
                    sortOrder = 0; // Visa first
                }
                else if (normalizedCardType === 'mastercard') {
                    sortOrder = 1; // Mastercard second
                }
                else if (normalizedCardType === 'discover') {
                    sortOrder = 2; // Discover third
                }
                else if (normalizedCardType === 'americanexpress') {
                    sortOrder = 3; // American Express fourth
                }
                // Create user-friendly display names to prevent UI issues with long card names
                let displayCardName = instrument.cardProduct;
                if (normalizedCardType === 'americanexpress') {
                    displayCardName = 'Amex';
                }
                else if (normalizedCardType === 'mastercard') {
                    displayCardName = 'Master';
                }
                else if (normalizedCardType === 'visa') {
                    displayCardName = 'Visa';
                }
                else if (normalizedCardType === 'discover') {
                    displayCardName = 'Discover';
                }
                const finalType = `Card-${normalizedCardType}`;
                devLog(environment, 'Final card type for icon mapping:', finalType);
                devLog(environment, 'Display card name:', displayCardName);
                return {
                    value: instrument.paymentInstrumentToken,
                    text: `${displayCardName}: ${instrument.maskedNumber}`,
                    type: finalType,
                    sortOrder
                };
            }
            else {
                // Handle other payment instrument types
                return {
                    value: instrument.paymentInstrumentToken,
                    text: `${instrument.paymentInstrumentType}: ${instrument.paymentInstrumentToken}`,
                    type: instrument.paymentInstrumentType,
                    sortOrder: 6 // Other types come last
                };
            }
        })
            .filter((option) => option !== null)
            // Sort by sortOrder first, then by text for items with same sort order
            .sort((a, b) => {
            if (a.sortOrder !== b.sortOrder) {
                return a.sortOrder - b.sortOrder;
            }
            return a.text.localeCompare(b.text);
        })
            // Remove the sortOrder property from the final objects
            .map(({ sortOrder, ...rest }) => rest);
        return { paymentOptions, availableCreditCards };
    }
    catch (error) {
        console.error('Error fetching payment options:', error);
        return { paymentOptions: [], availableCreditCards: null };
    }
}

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __decorate(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$3=t=>(e,o)=>{ void 0!==o?o.addInitializer((()=>{customElements.define(t,e);})):customElements.define(t,e);};

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$2=globalThis,e$6=t$2.ShadowRoot&&(void 0===t$2.ShadyCSS||t$2.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$2=Symbol(),o$5=new WeakMap;let n$3 = class n{constructor(t,e,o){if(this._$cssResult$=true,o!==s$2)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$6&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=o$5.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&o$5.set(s,t));}return t}toString(){return this.cssText}};const r$4=t=>new n$3("string"==typeof t?t:t+"",void 0,s$2),i$4=(t,...e)=>{const o=1===t.length?t[0]:e.reduce(((e,s,o)=>e+(t=>{if(true===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[o+1]),t[0]);return new n$3(o,t,s$2)},S$1=(s,o)=>{if(e$6)s.adoptedStyleSheets=o.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet));else for(const e of o){const o=document.createElement("style"),n=t$2.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=e.cssText,s.appendChild(o);}},c$2=e$6?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$4(e)})(t):t;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:i$3,defineProperty:e$5,getOwnPropertyDescriptor:h$1,getOwnPropertyNames:r$3,getOwnPropertySymbols:o$4,getPrototypeOf:n$2}=Object,a$1=globalThis,c$1=a$1.trustedTypes,l$1=c$1?c$1.emptyScript:"",p$1=a$1.reactiveElementPolyfillSupport,d$1=(t,s)=>t,u$1={toAttribute(t,s){switch(s){case Boolean:t=t?l$1:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,s){let i=t;switch(s){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t);}catch(t){i=null;}}return i}},f$1=(t,s)=>!i$3(t,s),b={attribute:true,type:String,converter:u$1,reflect:false,useDefault:false,hasChanged:f$1};Symbol.metadata??=Symbol("metadata"),a$1.litPropertyMetadata??=new WeakMap;let y$1 = class y extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t);}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=b){if(s.state&&(s.attribute=false),this._$Ei(),this.prototype.hasOwnProperty(t)&&((s=Object.create(s)).wrapped=true),this.elementProperties.set(t,s),!s.noAccessor){const i=Symbol(),h=this.getPropertyDescriptor(t,i,s);void 0!==h&&e$5(this.prototype,t,h);}}static getPropertyDescriptor(t,s,i){const{get:e,set:r}=h$1(this.prototype,t)??{get(){return this[s]},set(t){this[s]=t;}};return {get:e,set(s){const h=e?.call(this);r?.call(this,s),this.requestUpdate(t,h,i);},configurable:true,enumerable:true}}static getPropertyOptions(t){return this.elementProperties.get(t)??b}static _$Ei(){if(this.hasOwnProperty(d$1("elementProperties")))return;const t=n$2(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties);}static finalize(){if(this.hasOwnProperty(d$1("finalized")))return;if(this.finalized=true,this._$Ei(),this.hasOwnProperty(d$1("properties"))){const t=this.properties,s=[...r$3(t),...o$4(t)];for(const i of s)this.createProperty(i,t[i]);}const t=this[Symbol.metadata];if(null!==t){const s=litPropertyMetadata.get(t);if(void 0!==s)for(const[t,i]of s)this.elementProperties.set(t,i);}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const i=this._$Eu(t,s);void 0!==i&&this._$Eh.set(i,t);}this.elementStyles=this.finalizeStyles(this.styles);}static finalizeStyles(s){const i=[];if(Array.isArray(s)){const e=new Set(s.flat(1/0).reverse());for(const s of e)i.unshift(c$2(s));}else void 0!==s&&i.push(c$2(s));return i}static _$Eu(t,s){const i=s.attribute;return  false===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=false,this.hasUpdated=false,this._$Em=null,this._$Ev();}_$Ev(){this._$ES=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach((t=>t(this)));}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.();}removeController(t){this._$EO?.delete(t);}_$E_(){const t=new Map,s=this.constructor.elementProperties;for(const i of s.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t);}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return S$1(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(true),this._$EO?.forEach((t=>t.hostConnected?.()));}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach((t=>t.hostDisconnected?.()));}attributeChangedCallback(t,s,i){this._$AK(t,i);}_$ET(t,s){const i=this.constructor.elementProperties.get(t),e=this.constructor._$Eu(t,i);if(void 0!==e&&true===i.reflect){const h=(void 0!==i.converter?.toAttribute?i.converter:u$1).toAttribute(s,i.type);this._$Em=t,null==h?this.removeAttribute(e):this.setAttribute(e,h),this._$Em=null;}}_$AK(t,s){const i=this.constructor,e=i._$Eh.get(t);if(void 0!==e&&this._$Em!==e){const t=i.getPropertyOptions(e),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:u$1;this._$Em=e,this[e]=h.fromAttribute(s,t.type)??this._$Ej?.get(e)??null,this._$Em=null;}}requestUpdate(t,s,i){if(void 0!==t){const e=this.constructor,h=this[t];if(i??=e.getPropertyOptions(t),!((i.hasChanged??f$1)(h,s)||i.useDefault&&i.reflect&&h===this._$Ej?.get(t)&&!this.hasAttribute(e._$Eu(t,i))))return;this.C(t,s,i);} false===this.isUpdatePending&&(this._$ES=this._$EP());}C(t,s,{useDefault:i,reflect:e,wrapped:h},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??s??this[t]),true!==h||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(s=void 0),this._$AL.set(t,s)),true===e&&this._$Em!==t&&(this._$Eq??=new Set).add(t));}async _$EP(){this.isUpdatePending=true;try{await this._$ES;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,s]of this._$Ep)this[t]=s;this._$Ep=void 0;}const t=this.constructor.elementProperties;if(t.size>0)for(const[s,i]of t){const{wrapped:t}=i,e=this[s];true!==t||this._$AL.has(s)||void 0===e||this.C(s,void 0,i,e);}}let t=false;const s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$EO?.forEach((t=>t.hostUpdate?.())),this.update(s)):this._$EM();}catch(s){throw t=false,this._$EM(),s}t&&this._$AE(s);}willUpdate(t){}_$AE(t){this._$EO?.forEach((t=>t.hostUpdated?.())),this.hasUpdated||(this.hasUpdated=true,this.firstUpdated(t)),this.updated(t);}_$EM(){this._$AL=new Map,this.isUpdatePending=false;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return  true}update(t){this._$Eq&&=this._$Eq.forEach((t=>this._$ET(t,this[t]))),this._$EM();}updated(t){}firstUpdated(t){}};y$1.elementStyles=[],y$1.shadowRootOptions={mode:"open"},y$1[d$1("elementProperties")]=new Map,y$1[d$1("finalized")]=new Map,p$1?.({ReactiveElement:y$1}),(a$1.reactiveElementVersions??=[]).push("2.1.0");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const o$3={attribute:true,type:String,converter:u$1,reflect:false,hasChanged:f$1},r$2=(t=o$3,e,r)=>{const{kind:n,metadata:i}=r;let s=globalThis.litPropertyMetadata.get(i);if(void 0===s&&globalThis.litPropertyMetadata.set(i,s=new Map),"setter"===n&&((t=Object.create(t)).wrapped=true),s.set(r.name,t),"accessor"===n){const{name:o}=r;return {set(r){const n=e.get.call(this);e.set.call(this,r),this.requestUpdate(o,n,t);},init(e){return void 0!==e&&this.C(o,void 0,t,e),e}}}if("setter"===n){const{name:o}=r;return function(r){const n=this[o];e.call(this,r),this.requestUpdate(o,n,t);}}throw Error("Unsupported decorator location: "+n)};function n$1(t){return (e,o)=>"object"==typeof o?r$2(t,e,o):((t,e,o)=>{const r=e.hasOwnProperty(o);return e.constructor.createProperty(o,t),r?Object.getOwnPropertyDescriptor(e,o):void 0})(t,e,o)}

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function r$1(r){return n$1({...r,state:true,attribute:false})}

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e$4=(e,t,c)=>(c.configurable=true,c.enumerable=true,Reflect.decorate&&"object"!=typeof t&&Object.defineProperty(e,t,c),c);

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function e$3(e,r){return (n,s,i)=>{const o=t=>t.renderRoot?.querySelector(e)??null;return e$4(n,s,{get(){return o(this)}})}}

/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function o$2(o){return (e,n)=>{const{slot:r,selector:s}=o??{},c="slot"+(r?`[name=${r}]`:":not([name])");return e$4(e,n,{get(){const t=this.renderRoot?.querySelector(c),e=t?.assignedElements(o)??[];return void 0===s?e:e.filter((t=>t.matches(s)))}})}}

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1=globalThis,i$2=t$1.trustedTypes,s$1=i$2?i$2.createPolicy("lit-html",{createHTML:t=>t}):void 0,e$2="$lit$",h=`lit$${Math.random().toFixed(9).slice(2)}$`,o$1="?"+h,n=`<${o$1}>`,r=document,l=()=>r.createComment(""),c=t=>null===t||"object"!=typeof t&&"function"!=typeof t,a=Array.isArray,u=t=>a(t)||"function"==typeof t?.[Symbol.iterator],d="[ \t\n\f\r]",f=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,v=/-->/g,_=/>/g,m=RegExp(`>|${d}(?:([^\\s"'>=/]+)(${d}*=${d}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),p=/'/g,g=/"/g,$=/^(?:script|style|textarea|title)$/i,y=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),x=y(1),T=Symbol.for("lit-noChange"),E=Symbol.for("lit-nothing"),A=new WeakMap,C=r.createTreeWalker(r,129);function P(t,i){if(!a(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==s$1?s$1.createHTML(i):i}const V=(t,i)=>{const s=t.length-1,o=[];let r,l=2===i?"<svg>":3===i?"<math>":"",c=f;for(let i=0;i<s;i++){const s=t[i];let a,u,d=-1,y=0;for(;y<s.length&&(c.lastIndex=y,u=c.exec(s),null!==u);)y=c.lastIndex,c===f?"!--"===u[1]?c=v:void 0!==u[1]?c=_:void 0!==u[2]?($.test(u[2])&&(r=RegExp("</"+u[2],"g")),c=m):void 0!==u[3]&&(c=m):c===m?">"===u[0]?(c=r??f,d=-1):void 0===u[1]?d=-2:(d=c.lastIndex-u[2].length,a=u[1],c=void 0===u[3]?m:'"'===u[3]?g:p):c===g||c===p?c=m:c===v||c===_?c=f:(c=m,r=void 0);const x=c===m&&t[i+1].startsWith("/>")?" ":"";l+=c===f?s+n:d>=0?(o.push(a),s.slice(0,d)+e$2+s.slice(d)+h+x):s+h+(-2===d?i:x);}return [P(t,l+(t[s]||"<?>")+(2===i?"</svg>":3===i?"</math>":"")),o]};class N{constructor({strings:t,_$litType$:s},n){let r;this.parts=[];let c=0,a=0;const u=t.length-1,d=this.parts,[f,v]=V(t,s);if(this.el=N.createElement(f,n),C.currentNode=this.el.content,2===s||3===s){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes);}for(;null!==(r=C.nextNode())&&d.length<u;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(e$2)){const i=v[a++],s=r.getAttribute(t).split(h),e=/([.?@])?(.*)/.exec(i);d.push({type:1,index:c,name:e[2],strings:s,ctor:"."===e[1]?H:"?"===e[1]?I:"@"===e[1]?L:k}),r.removeAttribute(t);}else t.startsWith(h)&&(d.push({type:6,index:c}),r.removeAttribute(t));if($.test(r.tagName)){const t=r.textContent.split(h),s=t.length-1;if(s>0){r.textContent=i$2?i$2.emptyScript:"";for(let i=0;i<s;i++)r.append(t[i],l()),C.nextNode(),d.push({type:2,index:++c});r.append(t[s],l());}}}else if(8===r.nodeType)if(r.data===o$1)d.push({type:2,index:c});else {let t=-1;for(;-1!==(t=r.data.indexOf(h,t+1));)d.push({type:7,index:c}),t+=h.length-1;}c++;}}static createElement(t,i){const s=r.createElement("template");return s.innerHTML=t,s}}function S(t,i,s=t,e){if(i===T)return i;let h=void 0!==e?s._$Co?.[e]:s._$Cl;const o=c(i)?void 0:i._$litDirective$;return h?.constructor!==o&&(h?._$AO?.(false),void 0===o?h=void 0:(h=new o(t),h._$AT(t,s,e)),void 0!==e?(s._$Co??=[])[e]=h:s._$Cl=h),void 0!==h&&(i=S(t,h._$AS(t,i.values),h,e)),i}class M{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:i},parts:s}=this._$AD,e=(t?.creationScope??r).importNode(i,true);C.currentNode=e;let h=C.nextNode(),o=0,n=0,l=s[0];for(;void 0!==l;){if(o===l.index){let i;2===l.type?i=new R(h,h.nextSibling,this,t):1===l.type?i=new l.ctor(h,l.name,l.strings,this,t):6===l.type&&(i=new z(h,this,t)),this._$AV.push(i),l=s[++n];}o!==l?.index&&(h=C.nextNode(),o++);}return C.currentNode=r,e}p(t){let i=0;for(const s of this._$AV) void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class R{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,i,s,e){this.type=2,this._$AH=E,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cv=e?.isConnected??true;}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t?.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=S(this,t,i),c(t)?t===E||null==t||""===t?(this._$AH!==E&&this._$AR(),this._$AH=E):t!==this._$AH&&t!==T&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):u(t)?this.k(t):this._(t);}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}_(t){this._$AH!==E&&c(this._$AH)?this._$AA.nextSibling.data=t:this.T(r.createTextNode(t)),this._$AH=t;}$(t){const{values:i,_$litType$:s}=t,e="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=N.createElement(P(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===e)this._$AH.p(i);else {const t=new M(e,this),s=t.u(this.options);t.p(i),this.T(s),this._$AH=t;}}_$AC(t){let i=A.get(t.strings);return void 0===i&&A.set(t.strings,i=new N(t)),i}k(t){a(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const h of t)e===i.length?i.push(s=new R(this.O(l()),this.O(l()),this,this.options)):s=i[e],s._$AI(h),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,i){for(this._$AP?.(false,true,i);t&&t!==this._$AB;){const i=t.nextSibling;t.remove(),t=i;}}setConnected(t){ void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t));}}class k{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,i,s,e,h){this.type=1,this._$AH=E,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=h,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=E;}_$AI(t,i=this,s,e){const h=this.strings;let o=false;if(void 0===h)t=S(this,t,i,0),o=!c(t)||t!==this._$AH&&t!==T,o&&(this._$AH=t);else {const e=t;let n,r;for(t=h[0],n=0;n<h.length-1;n++)r=S(this,e[s+n],i,n),r===T&&(r=this._$AH[n]),o||=!c(r)||r!==this._$AH[n],r===E?t=E:t!==E&&(t+=(r??"")+h[n+1]),this._$AH[n]=r;}o&&!e&&this.j(t);}j(t){t===E?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"");}}class H extends k{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===E?void 0:t;}}class I extends k{constructor(){super(...arguments),this.type=4;}j(t){this.element.toggleAttribute(this.name,!!t&&t!==E);}}class L extends k{constructor(t,i,s,e,h){super(t,i,s,e,h),this.type=5;}_$AI(t,i=this){if((t=S(this,t,i,0)??E)===T)return;const s=this._$AH,e=t===E&&s!==E||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,h=t!==E&&(s===E||e);e&&this.element.removeEventListener(this.name,this,s),h&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t);}}class z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){S(this,t);}}const j=t$1.litHtmlPolyfillSupport;j?.(N,R),(t$1.litHtmlVersions??=[]).push("3.3.0");const B=(t,i,s)=>{const e=s?.renderBefore??i;let h=e._$litPart$;if(void 0===h){const t=s?.renderBefore??null;e._$litPart$=h=new R(i.insertBefore(l(),t),t,void 0,s??{});}return h._$AI(t),h};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const s=globalThis;let i$1 = class i extends y$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=B(r,this.renderRoot,this.renderOptions);}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(true);}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(false);}render(){return T}};i$1._$litElement$=true,i$1["finalized"]=true,s.litElementHydrateSupport?.({LitElement:i$1});const o=s.litElementPolyfillSupport;o?.({LitElement:i$1});(s.litElementVersions??=[]).push("4.2.0");

/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * A component for elevation.
 */
class Elevation extends i$1 {
    connectedCallback() {
        super.connectedCallback();
        // Needed for VoiceOver, which will create a "group" if the element is a
        // sibling to other content.
        this.setAttribute('aria-hidden', 'true');
    }
    render() {
        return x `<span class="shadow"></span>`;
    }
}

/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
// Generated stylesheet for ./elevation/internal/elevation-styles.css.
const styles$5 = i$4 `:host,.shadow,.shadow::before,.shadow::after{border-radius:inherit;inset:0;position:absolute;transition-duration:inherit;transition-property:inherit;transition-timing-function:inherit}:host{display:flex;pointer-events:none;transition-property:box-shadow,opacity}.shadow::before,.shadow::after{content:"";transition-property:box-shadow,opacity;--_level: var(--md-elevation-level, 0);--_shadow-color: var(--md-elevation-shadow-color, var(--md-sys-color-shadow, #000))}.shadow::before{box-shadow:0px calc(1px*(clamp(0,var(--_level),1) + clamp(0,var(--_level) - 3,1) + 2*clamp(0,var(--_level) - 4,1))) calc(1px*(2*clamp(0,var(--_level),1) + clamp(0,var(--_level) - 2,1) + clamp(0,var(--_level) - 4,1))) 0px var(--_shadow-color);opacity:.3}.shadow::after{box-shadow:0px calc(1px*(clamp(0,var(--_level),1) + clamp(0,var(--_level) - 1,1) + 2*clamp(0,var(--_level) - 2,3))) calc(1px*(3*clamp(0,var(--_level),2) + 2*clamp(0,var(--_level) - 2,3))) calc(1px*(clamp(0,var(--_level),4) + 2*clamp(0,var(--_level) - 4,1))) var(--_shadow-color);opacity:.15}
`;

/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * The `<md-elevation>` custom element with default styles.
 *
 * Elevation is the relative distance between two surfaces along the z-axis.
 *
 * @final
 * @suppress {visibility}
 */
let MdElevation = class MdElevation extends Elevation {
};
MdElevation.styles = [styles$5];
MdElevation = __decorate([
    t$3('md-elevation')
], MdElevation);

/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * A key to retrieve an `Attachable` element's `AttachableController` from a
 * global `MutationObserver`.
 */
const ATTACHABLE_CONTROLLER = Symbol('attachableController');
let FOR_ATTRIBUTE_OBSERVER;
{
    /**
     * A global `MutationObserver` that reacts to `for` attribute changes on
     * `Attachable` elements. If the `for` attribute changes, the controller will
     * re-attach to the new referenced element.
     */
    FOR_ATTRIBUTE_OBSERVER = new MutationObserver((records) => {
        for (const record of records) {
            // When a control's `for` attribute changes, inform its
            // `AttachableController` to update to a new control.
            record.target[ATTACHABLE_CONTROLLER]?.hostConnected();
        }
    });
}
/**
 * A controller that provides an implementation for `Attachable` elements.
 *
 * @example
 * ```ts
 * class MyElement extends LitElement implements Attachable {
 *   get control() { return this.attachableController.control; }
 *
 *   private readonly attachableController = new AttachableController(
 *     this,
 *     (previousControl, newControl) => {
 *       previousControl?.removeEventListener('click', this.handleClick);
 *       newControl?.addEventListener('click', this.handleClick);
 *     }
 *   );
 *
 *   // Implement remaining `Attachable` properties/methods that call the
 *   // controller's properties/methods.
 * }
 * ```
 */
class AttachableController {
    get htmlFor() {
        return this.host.getAttribute('for');
    }
    set htmlFor(htmlFor) {
        if (htmlFor === null) {
            this.host.removeAttribute('for');
        }
        else {
            this.host.setAttribute('for', htmlFor);
        }
    }
    get control() {
        if (this.host.hasAttribute('for')) {
            if (!this.htmlFor || !this.host.isConnected) {
                return null;
            }
            return this.host.getRootNode().querySelector(`#${this.htmlFor}`);
        }
        return this.currentControl || this.host.parentElement;
    }
    set control(control) {
        if (control) {
            this.attach(control);
        }
        else {
            this.detach();
        }
    }
    /**
     * Creates a new controller for an `Attachable` element.
     *
     * @param host The `Attachable` element.
     * @param onControlChange A callback with two parameters for the previous and
     *     next control. An `Attachable` element may perform setup or teardown
     *     logic whenever the control changes.
     */
    constructor(host, onControlChange) {
        this.host = host;
        this.onControlChange = onControlChange;
        this.currentControl = null;
        host.addController(this);
        host[ATTACHABLE_CONTROLLER] = this;
        FOR_ATTRIBUTE_OBSERVER?.observe(host, { attributeFilter: ['for'] });
    }
    attach(control) {
        if (control === this.currentControl) {
            return;
        }
        this.setCurrentControl(control);
        // When imperatively attaching, remove the `for` attribute so
        // that the attached control is used instead of a referenced one.
        this.host.removeAttribute('for');
    }
    detach() {
        this.setCurrentControl(null);
        // When imperatively detaching, add an empty `for=""` attribute. This will
        // ensure the control is `null` rather than the `parentElement`.
        this.host.setAttribute('for', '');
    }
    /** @private */
    hostConnected() {
        this.setCurrentControl(this.control);
    }
    /** @private */
    hostDisconnected() {
        this.setCurrentControl(null);
    }
    setCurrentControl(control) {
        this.onControlChange(this.currentControl, control);
        this.currentControl = control;
    }
}

/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Events that the focus ring listens to.
 */
const EVENTS$1 = ['focusin', 'focusout', 'pointerdown'];
/**
 * A focus ring component.
 *
 * @fires visibility-changed {Event} Fired whenever `visible` changes.
 */
class FocusRing extends i$1 {
    constructor() {
        super(...arguments);
        /**
         * Makes the focus ring visible.
         */
        this.visible = false;
        /**
         * Makes the focus ring animate inwards instead of outwards.
         */
        this.inward = false;
        this.attachableController = new AttachableController(this, this.onControlChange.bind(this));
    }
    get htmlFor() {
        return this.attachableController.htmlFor;
    }
    set htmlFor(htmlFor) {
        this.attachableController.htmlFor = htmlFor;
    }
    get control() {
        return this.attachableController.control;
    }
    set control(control) {
        this.attachableController.control = control;
    }
    attach(control) {
        this.attachableController.attach(control);
    }
    detach() {
        this.attachableController.detach();
    }
    connectedCallback() {
        super.connectedCallback();
        // Needed for VoiceOver, which will create a "group" if the element is a
        // sibling to other content.
        this.setAttribute('aria-hidden', 'true');
    }
    /** @private */
    handleEvent(event) {
        if (event[HANDLED_BY_FOCUS_RING]) {
            // This ensures the focus ring does not activate when multiple focus rings
            // are used within a single component.
            return;
        }
        switch (event.type) {
            default:
                return;
            case 'focusin':
                this.visible = this.control?.matches(':focus-visible') ?? false;
                break;
            case 'focusout':
            case 'pointerdown':
                this.visible = false;
                break;
        }
        event[HANDLED_BY_FOCUS_RING] = true;
    }
    onControlChange(prev, next) {
        for (const event of EVENTS$1) {
            prev?.removeEventListener(event, this);
            next?.addEventListener(event, this);
        }
    }
    update(changed) {
        if (changed.has('visible')) {
            // This logic can be removed once the `:has` selector has been introduced
            // to Firefox. This is necessary to allow correct submenu styles.
            this.dispatchEvent(new Event('visibility-changed'));
        }
        super.update(changed);
    }
}
__decorate([
    n$1({ type: Boolean, reflect: true })
], FocusRing.prototype, "visible", void 0);
__decorate([
    n$1({ type: Boolean, reflect: true })
], FocusRing.prototype, "inward", void 0);
const HANDLED_BY_FOCUS_RING = Symbol('handledByFocusRing');

/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
// Generated stylesheet for ./focus/internal/focus-ring-styles.css.
const styles$4 = i$4 `:host{animation-delay:0s,calc(var(--md-focus-ring-duration, 600ms)*.25);animation-duration:calc(var(--md-focus-ring-duration, 600ms)*.25),calc(var(--md-focus-ring-duration, 600ms)*.75);animation-timing-function:cubic-bezier(0.2, 0, 0, 1);box-sizing:border-box;color:var(--md-focus-ring-color, var(--md-sys-color-secondary, #625b71));display:none;pointer-events:none;position:absolute}:host([visible]){display:flex}:host(:not([inward])){animation-name:outward-grow,outward-shrink;border-end-end-radius:calc(var(--md-focus-ring-shape-end-end, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) + var(--md-focus-ring-outward-offset, 2px));border-end-start-radius:calc(var(--md-focus-ring-shape-end-start, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) + var(--md-focus-ring-outward-offset, 2px));border-start-end-radius:calc(var(--md-focus-ring-shape-start-end, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) + var(--md-focus-ring-outward-offset, 2px));border-start-start-radius:calc(var(--md-focus-ring-shape-start-start, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) + var(--md-focus-ring-outward-offset, 2px));inset:calc(-1*var(--md-focus-ring-outward-offset, 2px));outline:var(--md-focus-ring-width, 3px) solid currentColor}:host([inward]){animation-name:inward-grow,inward-shrink;border-end-end-radius:calc(var(--md-focus-ring-shape-end-end, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) - var(--md-focus-ring-inward-offset, 0px));border-end-start-radius:calc(var(--md-focus-ring-shape-end-start, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) - var(--md-focus-ring-inward-offset, 0px));border-start-end-radius:calc(var(--md-focus-ring-shape-start-end, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) - var(--md-focus-ring-inward-offset, 0px));border-start-start-radius:calc(var(--md-focus-ring-shape-start-start, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) - var(--md-focus-ring-inward-offset, 0px));border:var(--md-focus-ring-width, 3px) solid currentColor;inset:var(--md-focus-ring-inward-offset, 0px)}@keyframes outward-grow{from{outline-width:0}to{outline-width:var(--md-focus-ring-active-width, 8px)}}@keyframes outward-shrink{from{outline-width:var(--md-focus-ring-active-width, 8px)}}@keyframes inward-grow{from{border-width:0}to{border-width:var(--md-focus-ring-active-width, 8px)}}@keyframes inward-shrink{from{border-width:var(--md-focus-ring-active-width, 8px)}}@media(prefers-reduced-motion){:host{animation:none}}
`;

/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * TODO(b/267336424): add docs
 *
 * @final
 * @suppress {visibility}
 */
let MdFocusRing = class MdFocusRing extends FocusRing {
};
MdFocusRing.styles = [styles$4];
MdFocusRing = __decorate([
    t$3('md-focus-ring')
], MdFocusRing);

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t={ATTRIBUTE:1},e$1=t=>(...e)=>({_$litDirective$:t,values:e});class i{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i;}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}}

/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const e=e$1(class extends i{constructor(t$1){if(super(t$1),t$1.type!==t.ATTRIBUTE||"class"!==t$1.name||t$1.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(t){return " "+Object.keys(t).filter((s=>t[s])).join(" ")+" "}update(s,[i]){if(void 0===this.st){this.st=new Set,void 0!==s.strings&&(this.nt=new Set(s.strings.join(" ").split(/\s/).filter((t=>""!==t))));for(const t in i)i[t]&&!this.nt?.has(t)&&this.st.add(t);return this.render(i)}const r=s.element.classList;for(const t of this.st)t in i||(r.remove(t),this.st.delete(t));for(const t in i){const s=!!i[t];s===this.st.has(t)||this.nt?.has(t)||(s?(r.add(t),this.st.add(t)):(r.remove(t),this.st.delete(t)));}return T}});

/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Easing functions to use for web animations.
 *
 * **NOTE:** `EASING.EMPHASIZED` is approximated with unknown accuracy.
 *
 * TODO(b/241113345): replace with tokens
 */
const EASING = {
    STANDARD: 'cubic-bezier(0.2, 0, 0, 1)'};

/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const PRESS_GROW_MS = 450;
const MINIMUM_PRESS_MS = 225;
const INITIAL_ORIGIN_SCALE = 0.2;
const PADDING = 10;
const SOFT_EDGE_MINIMUM_SIZE = 75;
const SOFT_EDGE_CONTAINER_RATIO = 0.35;
const PRESS_PSEUDO = '::after';
const ANIMATION_FILL = 'forwards';
/**
 * Interaction states for the ripple.
 *
 * On Touch:
 *  - `INACTIVE -> TOUCH_DELAY -> WAITING_FOR_CLICK -> INACTIVE`
 *  - `INACTIVE -> TOUCH_DELAY -> HOLDING -> WAITING_FOR_CLICK -> INACTIVE`
 *
 * On Mouse or Pen:
 *   - `INACTIVE -> WAITING_FOR_CLICK -> INACTIVE`
 */
var State;
(function (State) {
    /**
     * Initial state of the control, no touch in progress.
     *
     * Transitions:
     *   - on touch down: transition to `TOUCH_DELAY`.
     *   - on mouse down: transition to `WAITING_FOR_CLICK`.
     */
    State[State["INACTIVE"] = 0] = "INACTIVE";
    /**
     * Touch down has been received, waiting to determine if it's a swipe or
     * scroll.
     *
     * Transitions:
     *   - on touch up: begin press; transition to `WAITING_FOR_CLICK`.
     *   - on cancel: transition to `INACTIVE`.
     *   - after `TOUCH_DELAY_MS`: begin press; transition to `HOLDING`.
     */
    State[State["TOUCH_DELAY"] = 1] = "TOUCH_DELAY";
    /**
     * A touch has been deemed to be a press
     *
     * Transitions:
     *  - on up: transition to `WAITING_FOR_CLICK`.
     */
    State[State["HOLDING"] = 2] = "HOLDING";
    /**
     * The user touch has finished, transition into rest state.
     *
     * Transitions:
     *   - on click end press; transition to `INACTIVE`.
     */
    State[State["WAITING_FOR_CLICK"] = 3] = "WAITING_FOR_CLICK";
})(State || (State = {}));
/**
 * Events that the ripple listens to.
 */
const EVENTS = [
    'click',
    'contextmenu',
    'pointercancel',
    'pointerdown',
    'pointerenter',
    'pointerleave',
    'pointerup',
];
/**
 * Delay reacting to touch so that we do not show the ripple for a swipe or
 * scroll interaction.
 */
const TOUCH_DELAY_MS = 150;
/**
 * Used to detect if HCM is active. Events do not process during HCM when the
 * ripple is not displayed.
 */
const FORCED_COLORS = window.matchMedia('(forced-colors: active)');
/**
 * A ripple component.
 */
class Ripple extends i$1 {
    constructor() {
        super(...arguments);
        /**
         * Disables the ripple.
         */
        this.disabled = false;
        this.hovered = false;
        this.pressed = false;
        this.rippleSize = '';
        this.rippleScale = '';
        this.initialSize = 0;
        this.state = State.INACTIVE;
        this.checkBoundsAfterContextMenu = false;
        this.attachableController = new AttachableController(this, this.onControlChange.bind(this));
    }
    get htmlFor() {
        return this.attachableController.htmlFor;
    }
    set htmlFor(htmlFor) {
        this.attachableController.htmlFor = htmlFor;
    }
    get control() {
        return this.attachableController.control;
    }
    set control(control) {
        this.attachableController.control = control;
    }
    attach(control) {
        this.attachableController.attach(control);
    }
    detach() {
        this.attachableController.detach();
    }
    connectedCallback() {
        super.connectedCallback();
        // Needed for VoiceOver, which will create a "group" if the element is a
        // sibling to other content.
        this.setAttribute('aria-hidden', 'true');
    }
    render() {
        const classes = {
            'hovered': this.hovered,
            'pressed': this.pressed,
        };
        return x `<div class="surface ${e(classes)}"></div>`;
    }
    update(changedProps) {
        if (changedProps.has('disabled') && this.disabled) {
            this.hovered = false;
            this.pressed = false;
        }
        super.update(changedProps);
    }
    /**
     * TODO(b/269799771): make private
     * @private only public for slider
     */
    handlePointerenter(event) {
        if (!this.shouldReactToEvent(event)) {
            return;
        }
        this.hovered = true;
    }
    /**
     * TODO(b/269799771): make private
     * @private only public for slider
     */
    handlePointerleave(event) {
        if (!this.shouldReactToEvent(event)) {
            return;
        }
        this.hovered = false;
        // release a held mouse or pen press that moves outside the element
        if (this.state !== State.INACTIVE) {
            this.endPressAnimation();
        }
    }
    handlePointerup(event) {
        if (!this.shouldReactToEvent(event)) {
            return;
        }
        if (this.state === State.HOLDING) {
            this.state = State.WAITING_FOR_CLICK;
            return;
        }
        if (this.state === State.TOUCH_DELAY) {
            this.state = State.WAITING_FOR_CLICK;
            this.startPressAnimation(this.rippleStartEvent);
            return;
        }
    }
    async handlePointerdown(event) {
        if (!this.shouldReactToEvent(event)) {
            return;
        }
        this.rippleStartEvent = event;
        if (!this.isTouch(event)) {
            this.state = State.WAITING_FOR_CLICK;
            this.startPressAnimation(event);
            return;
        }
        // after a longpress contextmenu event, an extra `pointerdown` can be
        // dispatched to the pressed element. Check that the down is within
        // bounds of the element in this case.
        if (this.checkBoundsAfterContextMenu && !this.inBounds(event)) {
            return;
        }
        this.checkBoundsAfterContextMenu = false;
        // Wait for a hold after touch delay
        this.state = State.TOUCH_DELAY;
        await new Promise((resolve) => {
            setTimeout(resolve, TOUCH_DELAY_MS);
        });
        if (this.state !== State.TOUCH_DELAY) {
            return;
        }
        this.state = State.HOLDING;
        this.startPressAnimation(event);
    }
    handleClick() {
        // Click is a MouseEvent in Firefox and Safari, so we cannot use
        // `shouldReactToEvent`
        if (this.disabled) {
            return;
        }
        if (this.state === State.WAITING_FOR_CLICK) {
            this.endPressAnimation();
            return;
        }
        if (this.state === State.INACTIVE) {
            // keyboard synthesized click event
            this.startPressAnimation();
            this.endPressAnimation();
        }
    }
    handlePointercancel(event) {
        if (!this.shouldReactToEvent(event)) {
            return;
        }
        this.endPressAnimation();
    }
    handleContextmenu() {
        if (this.disabled) {
            return;
        }
        this.checkBoundsAfterContextMenu = true;
        this.endPressAnimation();
    }
    determineRippleSize() {
        const { height, width } = this.getBoundingClientRect();
        const maxDim = Math.max(height, width);
        const softEdgeSize = Math.max(SOFT_EDGE_CONTAINER_RATIO * maxDim, SOFT_EDGE_MINIMUM_SIZE);
        const initialSize = Math.floor(maxDim * INITIAL_ORIGIN_SCALE);
        const hypotenuse = Math.sqrt(width ** 2 + height ** 2);
        const maxRadius = hypotenuse + PADDING;
        this.initialSize = initialSize;
        this.rippleScale = `${(maxRadius + softEdgeSize) / initialSize}`;
        this.rippleSize = `${initialSize}px`;
    }
    getNormalizedPointerEventCoords(pointerEvent) {
        const { scrollX, scrollY } = window;
        const { left, top } = this.getBoundingClientRect();
        const documentX = scrollX + left;
        const documentY = scrollY + top;
        const { pageX, pageY } = pointerEvent;
        return { x: pageX - documentX, y: pageY - documentY };
    }
    getTranslationCoordinates(positionEvent) {
        const { height, width } = this.getBoundingClientRect();
        // end in the center
        const endPoint = {
            x: (width - this.initialSize) / 2,
            y: (height - this.initialSize) / 2,
        };
        let startPoint;
        if (positionEvent instanceof PointerEvent) {
            startPoint = this.getNormalizedPointerEventCoords(positionEvent);
        }
        else {
            startPoint = {
                x: width / 2,
                y: height / 2,
            };
        }
        // center around start point
        startPoint = {
            x: startPoint.x - this.initialSize / 2,
            y: startPoint.y - this.initialSize / 2,
        };
        return { startPoint, endPoint };
    }
    startPressAnimation(positionEvent) {
        if (!this.mdRoot) {
            return;
        }
        this.pressed = true;
        this.growAnimation?.cancel();
        this.determineRippleSize();
        const { startPoint, endPoint } = this.getTranslationCoordinates(positionEvent);
        const translateStart = `${startPoint.x}px, ${startPoint.y}px`;
        const translateEnd = `${endPoint.x}px, ${endPoint.y}px`;
        this.growAnimation = this.mdRoot.animate({
            top: [0, 0],
            left: [0, 0],
            height: [this.rippleSize, this.rippleSize],
            width: [this.rippleSize, this.rippleSize],
            transform: [
                `translate(${translateStart}) scale(1)`,
                `translate(${translateEnd}) scale(${this.rippleScale})`,
            ],
        }, {
            pseudoElement: PRESS_PSEUDO,
            duration: PRESS_GROW_MS,
            easing: EASING.STANDARD,
            fill: ANIMATION_FILL,
        });
    }
    async endPressAnimation() {
        this.rippleStartEvent = undefined;
        this.state = State.INACTIVE;
        const animation = this.growAnimation;
        let pressAnimationPlayState = Infinity;
        if (typeof animation?.currentTime === 'number') {
            pressAnimationPlayState = animation.currentTime;
        }
        else if (animation?.currentTime) {
            pressAnimationPlayState = animation.currentTime.to('ms').value;
        }
        if (pressAnimationPlayState >= MINIMUM_PRESS_MS) {
            this.pressed = false;
            return;
        }
        await new Promise((resolve) => {
            setTimeout(resolve, MINIMUM_PRESS_MS - pressAnimationPlayState);
        });
        if (this.growAnimation !== animation) {
            // A new press animation was started. The old animation was canceled and
            // should not finish the pressed state.
            return;
        }
        this.pressed = false;
    }
    /**
     * Returns `true` if
     *  - the ripple element is enabled
     *  - the pointer is primary for the input type
     *  - the pointer is the pointer that started the interaction, or will start
     * the interaction
     *  - the pointer is a touch, or the pointer state has the primary button
     * held, or the pointer is hovering
     */
    shouldReactToEvent(event) {
        if (this.disabled || !event.isPrimary) {
            return false;
        }
        if (this.rippleStartEvent &&
            this.rippleStartEvent.pointerId !== event.pointerId) {
            return false;
        }
        if (event.type === 'pointerenter' || event.type === 'pointerleave') {
            return !this.isTouch(event);
        }
        const isPrimaryButton = event.buttons === 1;
        return this.isTouch(event) || isPrimaryButton;
    }
    /**
     * Check if the event is within the bounds of the element.
     *
     * This is only needed for the "stuck" contextmenu longpress on Chrome.
     */
    inBounds({ x, y }) {
        const { top, left, bottom, right } = this.getBoundingClientRect();
        return x >= left && x <= right && y >= top && y <= bottom;
    }
    isTouch({ pointerType }) {
        return pointerType === 'touch';
    }
    /** @private */
    async handleEvent(event) {
        if (FORCED_COLORS?.matches) {
            // Skip event logic since the ripple is `display: none`.
            return;
        }
        switch (event.type) {
            case 'click':
                this.handleClick();
                break;
            case 'contextmenu':
                this.handleContextmenu();
                break;
            case 'pointercancel':
                this.handlePointercancel(event);
                break;
            case 'pointerdown':
                await this.handlePointerdown(event);
                break;
            case 'pointerenter':
                this.handlePointerenter(event);
                break;
            case 'pointerleave':
                this.handlePointerleave(event);
                break;
            case 'pointerup':
                this.handlePointerup(event);
                break;
        }
    }
    onControlChange(prev, next) {
        for (const event of EVENTS) {
            prev?.removeEventListener(event, this);
            next?.addEventListener(event, this);
        }
    }
}
__decorate([
    n$1({ type: Boolean, reflect: true })
], Ripple.prototype, "disabled", void 0);
__decorate([
    r$1()
], Ripple.prototype, "hovered", void 0);
__decorate([
    r$1()
], Ripple.prototype, "pressed", void 0);
__decorate([
    e$3('.surface')
], Ripple.prototype, "mdRoot", void 0);

/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
// Generated stylesheet for ./ripple/internal/ripple-styles.css.
const styles$3 = i$4 `:host{display:flex;margin:auto;pointer-events:none}:host([disabled]){display:none}@media(forced-colors: active){:host{display:none}}:host,.surface{border-radius:inherit;position:absolute;inset:0;overflow:hidden}.surface{-webkit-tap-highlight-color:rgba(0,0,0,0)}.surface::before,.surface::after{content:"";opacity:0;position:absolute}.surface::before{background-color:var(--md-ripple-hover-color, var(--md-sys-color-on-surface, #1d1b20));inset:0;transition:opacity 15ms linear,background-color 15ms linear}.surface::after{background:radial-gradient(closest-side, var(--md-ripple-pressed-color, var(--md-sys-color-on-surface, #1d1b20)) max(100% - 70px, 65%), transparent 100%);transform-origin:center center;transition:opacity 375ms linear}.hovered::before{background-color:var(--md-ripple-hover-color, var(--md-sys-color-on-surface, #1d1b20));opacity:var(--md-ripple-hover-opacity, 0.08)}.pressed::after{opacity:var(--md-ripple-pressed-opacity, 0.12);transition-duration:105ms}
`;

/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * @summary Ripples, also known as state layers, are visual indicators used to
 * communicate the status of a component or interactive element.
 *
 * @description A state layer is a semi-transparent covering on an element that
 * indicates its state. State layers provide a systematic approach to
 * visualizing states by using opacity. A layer can be applied to an entire
 * element or in a circular shape and only one state layer can be applied at a
 * given time.
 *
 * @final
 * @suppress {visibility}
 */
let MdRipple = class MdRipple extends Ripple {
};
MdRipple.styles = [styles$3];
MdRipple = __decorate([
    t$3('md-ripple')
], MdRipple);

/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Accessibility Object Model reflective aria properties.
 */
const ARIA_PROPERTIES = [
    'role',
    'ariaAtomic',
    'ariaAutoComplete',
    'ariaBusy',
    'ariaChecked',
    'ariaColCount',
    'ariaColIndex',
    'ariaColSpan',
    'ariaCurrent',
    'ariaDisabled',
    'ariaExpanded',
    'ariaHasPopup',
    'ariaHidden',
    'ariaInvalid',
    'ariaKeyShortcuts',
    'ariaLabel',
    'ariaLevel',
    'ariaLive',
    'ariaModal',
    'ariaMultiLine',
    'ariaMultiSelectable',
    'ariaOrientation',
    'ariaPlaceholder',
    'ariaPosInSet',
    'ariaPressed',
    'ariaReadOnly',
    'ariaRequired',
    'ariaRoleDescription',
    'ariaRowCount',
    'ariaRowIndex',
    'ariaRowSpan',
    'ariaSelected',
    'ariaSetSize',
    'ariaSort',
    'ariaValueMax',
    'ariaValueMin',
    'ariaValueNow',
    'ariaValueText',
];
/**
 * Accessibility Object Model aria attributes.
 */
const ARIA_ATTRIBUTES = ARIA_PROPERTIES.map(ariaPropertyToAttribute);
/**
 * Checks if an attribute is one of the AOM aria attributes.
 *
 * @example
 * isAriaAttribute('aria-label'); // true
 *
 * @param attribute The attribute to check.
 * @return True if the attribute is an aria attribute, or false if not.
 */
function isAriaAttribute(attribute) {
    return ARIA_ATTRIBUTES.includes(attribute);
}
/**
 * Converts an AOM aria property into its corresponding attribute.
 *
 * @example
 * ariaPropertyToAttribute('ariaLabel'); // 'aria-label'
 *
 * @param property The aria property.
 * @return The aria attribute.
 */
function ariaPropertyToAttribute(property) {
    return property
        .replace('aria', 'aria-')
        // IDREF attributes also include an "Element" or "Elements" suffix
        .replace(/Elements?/g, '')
        .toLowerCase();
}

/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
// Private symbols
const privateIgnoreAttributeChangesFor = Symbol('privateIgnoreAttributeChangesFor');
/**
 * Mixes in aria delegation for elements that delegate focus and aria to inner
 * shadow root elements.
 *
 * This mixin fixes invalid aria announcements with shadow roots, caused by
 * duplicate aria attributes on both the host and the inner shadow root element.
 *
 * Note: this mixin **does not yet support** ID reference attributes, such as
 * `aria-labelledby` or `aria-controls`.
 *
 * @example
 * ```ts
 * class MyButton extends mixinDelegatesAria(LitElement) {
 *   static shadowRootOptions = {mode: 'open', delegatesFocus: true};
 *
 *   render() {
 *     return html`
 *       <button aria-label=${this.ariaLabel || nothing}>
 *         <slot></slot>
 *       </button>
 *     `;
 *   }
 * }
 * ```
 * ```html
 * <my-button aria-label="Plus one">+1</my-button>
 * ```
 *
 * Use `ARIAMixinStrict` for lit analyzer strict types, such as the "role"
 * attribute.
 *
 * @example
 * ```ts
 * return html`
 *   <button role=${(this as ARIAMixinStrict).role || nothing}>
 *     <slot></slot>
 *   </button>
 * `;
 * ```
 *
 * In the future, updates to the Accessibility Object Model (AOM) will provide
 * built-in aria delegation features that will replace this mixin.
 *
 * @param base The class to mix functionality into.
 * @return The provided class with aria delegation mixed in.
 */
function mixinDelegatesAria(base) {
    var _a;
    class WithDelegatesAriaElement extends base {
        constructor() {
            super(...arguments);
            this[_a] = new Set();
        }
        attributeChangedCallback(name, oldValue, newValue) {
            if (!isAriaAttribute(name)) {
                super.attributeChangedCallback(name, oldValue, newValue);
                return;
            }
            if (this[privateIgnoreAttributeChangesFor].has(name)) {
                return;
            }
            // Don't trigger another `attributeChangedCallback` once we remove the
            // aria attribute from the host. We check the explicit name of the
            // attribute to ignore since `attributeChangedCallback` can be called
            // multiple times out of an expected order when hydrating an element with
            // multiple attributes.
            this[privateIgnoreAttributeChangesFor].add(name);
            this.removeAttribute(name);
            this[privateIgnoreAttributeChangesFor].delete(name);
            const dataProperty = ariaAttributeToDataProperty(name);
            if (newValue === null) {
                delete this.dataset[dataProperty];
            }
            else {
                this.dataset[dataProperty] = newValue;
            }
            this.requestUpdate(ariaAttributeToDataProperty(name), oldValue);
        }
        getAttribute(name) {
            if (isAriaAttribute(name)) {
                return super.getAttribute(ariaAttributeToDataAttribute(name));
            }
            return super.getAttribute(name);
        }
        removeAttribute(name) {
            super.removeAttribute(name);
            if (isAriaAttribute(name)) {
                super.removeAttribute(ariaAttributeToDataAttribute(name));
                // Since `aria-*` attributes are already removed`, we need to request
                // an update because `attributeChangedCallback` will not be called.
                this.requestUpdate();
            }
        }
    }
    _a = privateIgnoreAttributeChangesFor;
    setupDelegatesAriaProperties(WithDelegatesAriaElement);
    return WithDelegatesAriaElement;
}
/**
 * Overrides the constructor's native `ARIAMixin` properties to ensure that
 * aria properties reflect the values that were shifted to a data attribute.
 *
 * @param ctor The `ReactiveElement` constructor to patch.
 */
function setupDelegatesAriaProperties(ctor) {
    for (const ariaProperty of ARIA_PROPERTIES) {
        // The casing between ariaProperty and the dataProperty may be different.
        // ex: aria-haspopup -> ariaHasPopup
        const ariaAttribute = ariaPropertyToAttribute(ariaProperty);
        // ex: aria-haspopup -> data-aria-haspopup
        const dataAttribute = ariaAttributeToDataAttribute(ariaAttribute);
        // ex: aria-haspopup -> dataset.ariaHaspopup
        const dataProperty = ariaAttributeToDataProperty(ariaAttribute);
        // Call `ReactiveElement.createProperty()` so that the `aria-*` and `data-*`
        // attributes are added to the `static observedAttributes` array. This
        // triggers `attributeChangedCallback` for the delegates aria mixin to
        // handle.
        ctor.createProperty(ariaProperty, {
            attribute: ariaAttribute,
            noAccessor: true,
        });
        ctor.createProperty(Symbol(dataAttribute), {
            attribute: dataAttribute,
            noAccessor: true,
        });
        // Re-define the `ARIAMixin` properties to handle data attribute shifting.
        // It is safe to use `Object.defineProperty` here because the properties
        // are native and not renamed.
        // tslint:disable-next-line:ban-unsafe-reflection
        Object.defineProperty(ctor.prototype, ariaProperty, {
            configurable: true,
            enumerable: true,
            get() {
                return this.dataset[dataProperty] ?? null;
            },
            set(value) {
                const prevValue = this.dataset[dataProperty] ?? null;
                if (value === prevValue) {
                    return;
                }
                if (value === null) {
                    delete this.dataset[dataProperty];
                }
                else {
                    this.dataset[dataProperty] = value;
                }
                this.requestUpdate(ariaProperty, prevValue);
            },
        });
    }
}
function ariaAttributeToDataAttribute(ariaAttribute) {
    // aria-haspopup -> data-aria-haspopup
    return `data-${ariaAttribute}`;
}
function ariaAttributeToDataProperty(ariaAttribute) {
    // aria-haspopup -> dataset.ariaHaspopup
    return ariaAttribute.replace(/-\w/, (dashLetter) => dashLetter[1].toUpperCase());
}

/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * A unique symbol used for protected access to an instance's
 * `ElementInternals`.
 *
 * @example
 * ```ts
 * class MyElement extends mixinElementInternals(LitElement) {
 *   constructor() {
 *     super();
 *     this[internals].role = 'button';
 *   }
 * }
 * ```
 */
const internals = Symbol('internals');
// Private symbols
const privateInternals = Symbol('privateInternals');
/**
 * Mixes in an attached `ElementInternals` instance.
 *
 * This mixin is only needed when other shared code needs access to a
 * component's `ElementInternals`, such as form-associated mixins.
 *
 * @param base The class to mix functionality into.
 * @return The provided class with `WithElementInternals` mixed in.
 */
function mixinElementInternals(base) {
    class WithElementInternalsElement extends base {
        get [internals]() {
            // Create internals in getter so that it can be used in methods called on
            // construction in `ReactiveElement`, such as `requestUpdate()`.
            if (!this[privateInternals]) {
                // Cast needed for closure
                this[privateInternals] = this.attachInternals();
            }
            return this[privateInternals];
        }
    }
    return WithElementInternalsElement;
}

/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Sets up an element's constructor to enable form submission. The element
 * instance should be form associated and have a `type` property.
 *
 * A click listener is added to each element instance. If the click is not
 * default prevented, it will submit the element's form, if any.
 *
 * @example
 * ```ts
 * class MyElement extends mixinElementInternals(LitElement) {
 *   static {
 *     setupFormSubmitter(MyElement);
 *   }
 *
 *   static formAssociated = true;
 *
 *   type: FormSubmitterType = 'submit';
 * }
 * ```
 *
 * @param ctor The form submitter element's constructor.
 */
function setupFormSubmitter(ctor) {
    ctor.addInitializer((instance) => {
        const submitter = instance;
        submitter.addEventListener('click', async (event) => {
            const { type, [internals]: elementInternals } = submitter;
            const { form } = elementInternals;
            if (!form || type === 'button') {
                return;
            }
            // Wait a full task for event bubbling to complete.
            await new Promise((resolve) => {
                setTimeout(resolve);
            });
            if (event.defaultPrevented) {
                return;
            }
            if (type === 'reset') {
                form.reset();
                return;
            }
            // form.requestSubmit(submitter) does not work with form associated custom
            // elements. This patches the dispatched submit event to add the correct
            // `submitter`.
            // See https://github.com/WICG/webcomponents/issues/814
            form.addEventListener('submit', (submitEvent) => {
                Object.defineProperty(submitEvent, 'submitter', {
                    configurable: true,
                    enumerable: true,
                    get: () => submitter,
                });
            }, { capture: true, once: true });
            elementInternals.setFormValue(submitter.value);
            form.requestSubmit();
        });
    });
}

/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Dispatches a click event to the given element that triggers a native action,
 * but is not composed and therefore is not seen outside the element.
 *
 * This is useful for responding to an external click event on the host element
 * that should trigger an internal action like a button click.
 *
 * Note, a helper is provided because setting this up correctly is a bit tricky.
 * In particular, calling `click` on an element creates a composed event, which
 * is not desirable, and a manually dispatched event must specifically be a
 * `MouseEvent` to trigger a native action.
 *
 * @example
 * hostClickListener = (event: MouseEvent) {
 *   if (isActivationClick(event)) {
 *     this.dispatchActivationClick(this.buttonElement);
 *   }
 * }
 *
 */
function dispatchActivationClick(element) {
    const event = new MouseEvent('click', { bubbles: true });
    element.dispatchEvent(event);
    return event;
}
/**
 * Returns true if the click event should trigger an activation behavior. The
 * behavior is defined by the element and is whatever it should do when
 * clicked.
 *
 * Typically when an element needs to handle a click, the click is generated
 * from within the element and an event listener within the element implements
 * the needed behavior; however, it's possible to fire a click directly
 * at the element that the element should handle. This method helps
 * distinguish these "external" clicks.
 *
 * An "external" click can be triggered in a number of ways: via a click
 * on an associated label for a form  associated element, calling
 * `element.click()`, or calling
 * `element.dispatchEvent(new MouseEvent('click', ...))`.
 *
 * Also works around Firefox issue
 * https://bugzilla.mozilla.org/show_bug.cgi?id=1804576 by squelching
 * events for a microtask after called.
 *
 * @example
 * hostClickListener = (event: MouseEvent) {
 *   if (isActivationClick(event)) {
 *     this.dispatchActivationClick(this.buttonElement);
 *   }
 * }
 *
 */
function isActivationClick(event) {
    // Event must start at the event target.
    if (event.currentTarget !== event.target) {
        return false;
    }
    // Event must not be retargeted from shadowRoot.
    if (event.composedPath()[0] !== event.target) {
        return false;
    }
    // Target must not be disabled; this should only occur for a synthetically
    // dispatched click.
    if (event.target.disabled) {
        return false;
    }
    // This is an activation if the event should not be squelched.
    return !squelchEvent(event);
}
// TODO(https://bugzilla.mozilla.org/show_bug.cgi?id=1804576)
//  Remove when Firefox bug is addressed.
function squelchEvent(event) {
    const squelched = isSquelchingEvents;
    if (squelched) {
        event.preventDefault();
        event.stopImmediatePropagation();
    }
    squelchEventsForMicrotask();
    return squelched;
}
// Ignore events for one microtask only.
let isSquelchingEvents = false;
async function squelchEventsForMicrotask() {
    isSquelchingEvents = true;
    // Need to pause for just one microtask.
    // tslint:disable-next-line
    await null;
    isSquelchingEvents = false;
}

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
// Separate variable needed for closure.
const buttonBaseClass = mixinDelegatesAria(mixinElementInternals(i$1));
/**
 * A button component.
 */
class Button extends buttonBaseClass {
    get name() {
        return this.getAttribute('name') ?? '';
    }
    set name(name) {
        this.setAttribute('name', name);
    }
    /**
     * The associated form element with which this element's value will submit.
     */
    get form() {
        return this[internals].form;
    }
    constructor() {
        super();
        /**
         * Whether or not the button is disabled.
         */
        this.disabled = false;
        /**
         * Whether or not the button is "soft-disabled" (disabled but still
         * focusable).
         *
         * Use this when a button needs increased visibility when disabled. See
         * https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_disabled_controls
         * for more guidance on when this is needed.
         */
        this.softDisabled = false;
        /**
         * The URL that the link button points to.
         */
        this.href = '';
        /**
         * The filename to use when downloading the linked resource.
         * If not specified, the browser will determine a filename.
         * This is only applicable when the button is used as a link (`href` is set).
         */
        this.download = '';
        /**
         * Where to display the linked `href` URL for a link button. Common options
         * include `_blank` to open in a new tab.
         */
        this.target = '';
        /**
         * Whether to render the icon at the inline end of the label rather than the
         * inline start.
         *
         * _Note:_ Link buttons cannot have trailing icons.
         */
        this.trailingIcon = false;
        /**
         * Whether to display the icon or not.
         */
        this.hasIcon = false;
        /**
         * The default behavior of the button. May be "button", "reset", or "submit"
         * (default).
         */
        this.type = 'submit';
        /**
         * The value added to a form with the button's name when the button submits a
         * form.
         */
        this.value = '';
        {
            this.addEventListener('click', this.handleClick.bind(this));
        }
    }
    focus() {
        this.buttonElement?.focus();
    }
    blur() {
        this.buttonElement?.blur();
    }
    render() {
        // Link buttons may not be disabled
        const isRippleDisabled = !this.href && (this.disabled || this.softDisabled);
        const buttonOrLink = this.href ? this.renderLink() : this.renderButton();
        // TODO(b/310046938): due to a limitation in focus ring/ripple, we can't use
        // the same ID for different elements, so we change the ID instead.
        const buttonId = this.href ? 'link' : 'button';
        return x `
      ${this.renderElevationOrOutline?.()}
      <div class="background"></div>
      <md-focus-ring part="focus-ring" for=${buttonId}></md-focus-ring>
      <md-ripple
        part="ripple"
        for=${buttonId}
        ?disabled="${isRippleDisabled}"></md-ripple>
      ${buttonOrLink}
    `;
    }
    renderButton() {
        // Needed for closure conformance
        const { ariaLabel, ariaHasPopup, ariaExpanded } = this;
        return x `<button
      id="button"
      class="button"
      ?disabled=${this.disabled}
      aria-disabled=${this.softDisabled || E}
      aria-label="${ariaLabel || E}"
      aria-haspopup="${ariaHasPopup || E}"
      aria-expanded="${ariaExpanded || E}">
      ${this.renderContent()}
    </button>`;
    }
    renderLink() {
        // Needed for closure conformance
        const { ariaLabel, ariaHasPopup, ariaExpanded } = this;
        return x `<a
      id="link"
      class="button"
      aria-label="${ariaLabel || E}"
      aria-haspopup="${ariaHasPopup || E}"
      aria-expanded="${ariaExpanded || E}"
      href=${this.href}
      download=${this.download || E}
      target=${this.target || E}
      >${this.renderContent()}
    </a>`;
    }
    renderContent() {
        const icon = x `<slot
      name="icon"
      @slotchange="${this.handleSlotChange}"></slot>`;
        return x `
      <span class="touch"></span>
      ${this.trailingIcon ? E : icon}
      <span class="label"><slot></slot></span>
      ${this.trailingIcon ? icon : E}
    `;
    }
    handleClick(event) {
        // If the button is soft-disabled, we need to explicitly prevent the click
        // from propagating to other event listeners as well as prevent the default
        // action.
        if (!this.href && this.softDisabled) {
            event.stopImmediatePropagation();
            event.preventDefault();
            return;
        }
        if (!isActivationClick(event) || !this.buttonElement) {
            return;
        }
        this.focus();
        dispatchActivationClick(this.buttonElement);
    }
    handleSlotChange() {
        this.hasIcon = this.assignedIcons.length > 0;
    }
}
(() => {
    setupFormSubmitter(Button);
})();
/** @nocollapse */
Button.formAssociated = true;
/** @nocollapse */
Button.shadowRootOptions = {
    mode: 'open',
    delegatesFocus: true,
};
__decorate([
    n$1({ type: Boolean, reflect: true })
], Button.prototype, "disabled", void 0);
__decorate([
    n$1({ type: Boolean, attribute: 'soft-disabled', reflect: true })
], Button.prototype, "softDisabled", void 0);
__decorate([
    n$1()
], Button.prototype, "href", void 0);
__decorate([
    n$1()
], Button.prototype, "download", void 0);
__decorate([
    n$1()
], Button.prototype, "target", void 0);
__decorate([
    n$1({ type: Boolean, attribute: 'trailing-icon', reflect: true })
], Button.prototype, "trailingIcon", void 0);
__decorate([
    n$1({ type: Boolean, attribute: 'has-icon', reflect: true })
], Button.prototype, "hasIcon", void 0);
__decorate([
    n$1()
], Button.prototype, "type", void 0);
__decorate([
    n$1({ reflect: true })
], Button.prototype, "value", void 0);
__decorate([
    e$3('.button')
], Button.prototype, "buttonElement", void 0);
__decorate([
    o$2({ slot: 'icon', flatten: true })
], Button.prototype, "assignedIcons", void 0);

/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * A filled button component.
 */
class FilledButton extends Button {
    renderElevationOrOutline() {
        return x `<md-elevation part="elevation"></md-elevation>`;
    }
}

/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
// Generated stylesheet for ./button/internal/filled-styles.css.
const styles$2 = i$4 `:host{--_container-color: var(--md-filled-button-container-color, var(--md-sys-color-primary, #6750a4));--_container-elevation: var(--md-filled-button-container-elevation, 0);--_container-height: var(--md-filled-button-container-height, 40px);--_container-shadow-color: var(--md-filled-button-container-shadow-color, var(--md-sys-color-shadow, #000));--_disabled-container-color: var(--md-filled-button-disabled-container-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-container-elevation: var(--md-filled-button-disabled-container-elevation, 0);--_disabled-container-opacity: var(--md-filled-button-disabled-container-opacity, 0.12);--_disabled-label-text-color: var(--md-filled-button-disabled-label-text-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-label-text-opacity: var(--md-filled-button-disabled-label-text-opacity, 0.38);--_focus-container-elevation: var(--md-filled-button-focus-container-elevation, 0);--_focus-label-text-color: var(--md-filled-button-focus-label-text-color, var(--md-sys-color-on-primary, #fff));--_hover-container-elevation: var(--md-filled-button-hover-container-elevation, 1);--_hover-label-text-color: var(--md-filled-button-hover-label-text-color, var(--md-sys-color-on-primary, #fff));--_hover-state-layer-color: var(--md-filled-button-hover-state-layer-color, var(--md-sys-color-on-primary, #fff));--_hover-state-layer-opacity: var(--md-filled-button-hover-state-layer-opacity, 0.08);--_label-text-color: var(--md-filled-button-label-text-color, var(--md-sys-color-on-primary, #fff));--_label-text-font: var(--md-filled-button-label-text-font, var(--md-sys-typescale-label-large-font, var(--md-ref-typeface-plain, Roboto)));--_label-text-line-height: var(--md-filled-button-label-text-line-height, var(--md-sys-typescale-label-large-line-height, 1.25rem));--_label-text-size: var(--md-filled-button-label-text-size, var(--md-sys-typescale-label-large-size, 0.875rem));--_label-text-weight: var(--md-filled-button-label-text-weight, var(--md-sys-typescale-label-large-weight, var(--md-ref-typeface-weight-medium, 500)));--_pressed-container-elevation: var(--md-filled-button-pressed-container-elevation, 0);--_pressed-label-text-color: var(--md-filled-button-pressed-label-text-color, var(--md-sys-color-on-primary, #fff));--_pressed-state-layer-color: var(--md-filled-button-pressed-state-layer-color, var(--md-sys-color-on-primary, #fff));--_pressed-state-layer-opacity: var(--md-filled-button-pressed-state-layer-opacity, 0.12);--_disabled-icon-color: var(--md-filled-button-disabled-icon-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-icon-opacity: var(--md-filled-button-disabled-icon-opacity, 0.38);--_focus-icon-color: var(--md-filled-button-focus-icon-color, var(--md-sys-color-on-primary, #fff));--_hover-icon-color: var(--md-filled-button-hover-icon-color, var(--md-sys-color-on-primary, #fff));--_icon-color: var(--md-filled-button-icon-color, var(--md-sys-color-on-primary, #fff));--_icon-size: var(--md-filled-button-icon-size, 18px);--_pressed-icon-color: var(--md-filled-button-pressed-icon-color, var(--md-sys-color-on-primary, #fff));--_container-shape-start-start: var(--md-filled-button-container-shape-start-start, var(--md-filled-button-container-shape, var(--md-sys-shape-corner-full, 9999px)));--_container-shape-start-end: var(--md-filled-button-container-shape-start-end, var(--md-filled-button-container-shape, var(--md-sys-shape-corner-full, 9999px)));--_container-shape-end-end: var(--md-filled-button-container-shape-end-end, var(--md-filled-button-container-shape, var(--md-sys-shape-corner-full, 9999px)));--_container-shape-end-start: var(--md-filled-button-container-shape-end-start, var(--md-filled-button-container-shape, var(--md-sys-shape-corner-full, 9999px)));--_leading-space: var(--md-filled-button-leading-space, 24px);--_trailing-space: var(--md-filled-button-trailing-space, 24px);--_with-leading-icon-leading-space: var(--md-filled-button-with-leading-icon-leading-space, 16px);--_with-leading-icon-trailing-space: var(--md-filled-button-with-leading-icon-trailing-space, 24px);--_with-trailing-icon-leading-space: var(--md-filled-button-with-trailing-icon-leading-space, 24px);--_with-trailing-icon-trailing-space: var(--md-filled-button-with-trailing-icon-trailing-space, 16px)}
`;

/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
// Generated stylesheet for ./button/internal/shared-elevation-styles.css.
const styles$1 = i$4 `md-elevation{transition-duration:280ms}:host(:is([disabled],[soft-disabled])) md-elevation{transition:none}md-elevation{--md-elevation-level: var(--_container-elevation);--md-elevation-shadow-color: var(--_container-shadow-color)}:host(:focus-within) md-elevation{--md-elevation-level: var(--_focus-container-elevation)}:host(:hover) md-elevation{--md-elevation-level: var(--_hover-container-elevation)}:host(:active) md-elevation{--md-elevation-level: var(--_pressed-container-elevation)}:host(:is([disabled],[soft-disabled])) md-elevation{--md-elevation-level: var(--_disabled-container-elevation)}
`;

/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
// Generated stylesheet for ./button/internal/shared-styles.css.
const styles = i$4 `:host{border-start-start-radius:var(--_container-shape-start-start);border-start-end-radius:var(--_container-shape-start-end);border-end-start-radius:var(--_container-shape-end-start);border-end-end-radius:var(--_container-shape-end-end);box-sizing:border-box;cursor:pointer;display:inline-flex;gap:8px;min-height:var(--_container-height);outline:none;padding-block:calc((var(--_container-height) - max(var(--_label-text-line-height),var(--_icon-size)))/2);padding-inline-start:var(--_leading-space);padding-inline-end:var(--_trailing-space);place-content:center;place-items:center;position:relative;font-family:var(--_label-text-font);font-size:var(--_label-text-size);line-height:var(--_label-text-line-height);font-weight:var(--_label-text-weight);text-overflow:ellipsis;text-wrap:nowrap;user-select:none;-webkit-tap-highlight-color:rgba(0,0,0,0);vertical-align:top;--md-ripple-hover-color: var(--_hover-state-layer-color);--md-ripple-pressed-color: var(--_pressed-state-layer-color);--md-ripple-hover-opacity: var(--_hover-state-layer-opacity);--md-ripple-pressed-opacity: var(--_pressed-state-layer-opacity)}md-focus-ring{--md-focus-ring-shape-start-start: var(--_container-shape-start-start);--md-focus-ring-shape-start-end: var(--_container-shape-start-end);--md-focus-ring-shape-end-end: var(--_container-shape-end-end);--md-focus-ring-shape-end-start: var(--_container-shape-end-start)}:host(:is([disabled],[soft-disabled])){cursor:default;pointer-events:none}.button{border-radius:inherit;cursor:inherit;display:inline-flex;align-items:center;justify-content:center;border:none;outline:none;-webkit-appearance:none;vertical-align:middle;background:rgba(0,0,0,0);text-decoration:none;min-width:calc(64px - var(--_leading-space) - var(--_trailing-space));width:100%;z-index:0;height:100%;font:inherit;color:var(--_label-text-color);padding:0;gap:inherit;text-transform:inherit}.button::-moz-focus-inner{padding:0;border:0}:host(:hover) .button{color:var(--_hover-label-text-color)}:host(:focus-within) .button{color:var(--_focus-label-text-color)}:host(:active) .button{color:var(--_pressed-label-text-color)}.background{background-color:var(--_container-color);border-radius:inherit;inset:0;position:absolute}.label{overflow:hidden}:is(.button,.label,.label slot),.label ::slotted(*){text-overflow:inherit}:host(:is([disabled],[soft-disabled])) .label{color:var(--_disabled-label-text-color);opacity:var(--_disabled-label-text-opacity)}:host(:is([disabled],[soft-disabled])) .background{background-color:var(--_disabled-container-color);opacity:var(--_disabled-container-opacity)}@media(forced-colors: active){.background{border:1px solid CanvasText}:host(:is([disabled],[soft-disabled])){--_disabled-icon-color: GrayText;--_disabled-icon-opacity: 1;--_disabled-container-opacity: 1;--_disabled-label-text-color: GrayText;--_disabled-label-text-opacity: 1}}:host([has-icon]:not([trailing-icon])){padding-inline-start:var(--_with-leading-icon-leading-space);padding-inline-end:var(--_with-leading-icon-trailing-space)}:host([has-icon][trailing-icon]){padding-inline-start:var(--_with-trailing-icon-leading-space);padding-inline-end:var(--_with-trailing-icon-trailing-space)}::slotted([slot=icon]){display:inline-flex;position:relative;writing-mode:horizontal-tb;fill:currentColor;flex-shrink:0;color:var(--_icon-color);font-size:var(--_icon-size);inline-size:var(--_icon-size);block-size:var(--_icon-size)}:host(:hover) ::slotted([slot=icon]){color:var(--_hover-icon-color)}:host(:focus-within) ::slotted([slot=icon]){color:var(--_focus-icon-color)}:host(:active) ::slotted([slot=icon]){color:var(--_pressed-icon-color)}:host(:is([disabled],[soft-disabled])) ::slotted([slot=icon]){color:var(--_disabled-icon-color);opacity:var(--_disabled-icon-opacity)}.touch{position:absolute;top:50%;height:48px;left:0;right:0;transform:translateY(-50%)}:host([touch-target=wrapper]){margin:max(0px,(48px - var(--_container-height))/2) 0}:host([touch-target=none]) .touch{display:none}
`;

/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * @summary Buttons help people take action, such as sending an email, sharing a
 * document, or liking a comment.
 *
 * @description
 * __Emphasis:__ High emphasis – For the primary, most important, or most common
 * action on a screen
 *
 * __Rationale:__ The filled button’s contrasting surface color makes it the
 * most prominent button after the FAB. It’s used for final or unblocking
 * actions in a flow.
 *
 * __Example usages:__
 * - Save
 * - Confirm
 * - Done
 *
 * @final
 * @suppress {visibility}
 */
let MdFilledButton = class MdFilledButton extends FilledButton {
};
MdFilledButton.styles = [
    styles,
    styles$1,
    styles$2,
];
MdFilledButton = __decorate([
    t$3('md-filled-button')
], MdFilledButton);

const walletdropdownModuleCss = ":host, :root {\r\n    --wallet-primary-color: #282829;\r\n    --wallet-background-color: #fff;\r\n    --wallet-medium-gray: #c6ccd0;\r\n    --wallet-border-gray: #e9eaeb;\r\n    --wallet-error-color: #f01a1f;\r\n    --wallet-error-background: #ffebee;\r\n    --md-filled-button-container-color: #282829; \r\n  }\r\n\r\n.shared-wallet {\r\n    display: flex;\r\n    flex-direction: column;\r\n    align-items: center;\r\n  /*  min-height: 100vh; */\r\n    font-family: 'Inter', sans-serif;\r\n    container-name: sharedWallet;\r\n    container-type: inline-size;\r\n    background-color: var(--wallet-background-color);\r\n    padding-top: 32px;\r\n}\r\n\r\n\r\n.payment-selector {\r\n    width: 100%;\r\n    max-width: 400px;\r\n    border: 0 !important;\r\n\r\n    .button + .button{\r\n        margin-left: 0;\r\n        margin-top: 16px\r\n    }\r\n    \r\n    /* Picklist button styling */\r\n    .picklist-button {\r\n        display: flex;\r\n        align-items: center;\r\n        justify-content: space-between;\r\n        width: 100%;\r\n        padding: 12px 16px;\r\n        background-color: #fff;\r\n        border: 1px solid var(--wallet-border-gray);\r\n        border-radius: 4px;\r\n        cursor: pointer;\r\n        transition: all 0.2s ease;\r\n        \r\n        &:hover {\r\n            border-color: var(--wallet-primary-color);\r\n        }\r\n        \r\n        &::after {\r\n            content: '';\r\n            display: block;\r\n            width: 12px;\r\n            height: 12px;\r\n            background-image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwLjI5MyA0LjI5Mkw2IDguNTg2TDEuNzA3IDQuMjkyTDEgNUw2IDEwTDExIDVMMTAuMjkzIDQuMjkyWiIgZmlsbD0iIzI4MjgyOSIvPgo8L3N2Zz4K);\r\n            background-repeat: no-repeat;\r\n            background-position: center;\r\n        }\r\n    }\r\n\r\n    .payment-list {\r\n        list-style-type: none;\r\n        padding: 0;\r\n        margin-bottom: 24px;\r\n        margin-top: 0;\r\n\r\n        .payment-list-item {\r\n            position: relative;\r\n            border-bottom: solid #E9EAEB 1px;\r\n            cursor: pointer;\r\n\r\n            label {\r\n                width: 100%;\r\n                padding: 16px 0;\r\n            }\r\n\r\n            input {\r\n                position: absolute;\r\n            }\r\n        }\r\n\r\n        .payment-name {\r\n            margin: 0;\r\n        }\r\n    \r\n        .payment-option {\r\n            width: 100%;\r\n            display: flex;\r\n            justify-content: space-between;\r\n            padding-left: 30px;\r\n        }\r\n    }\r\n    \r\n\r\n    .selected-payment {\r\n        display: flex;\r\n        align-items: center;\r\n        gap: 8px;\r\n        text-align: right;\r\n        max-width: 100%;\r\n        overflow: hidden;\r\n        white-space: nowrap;\r\n        text-overflow: ellipsis;\r\n        flex-wrap: nowrap;\r\n    }\r\n    \r\n    .selected-payment > *:first-child {\r\n        flex: 1;\r\n        min-width: 0;\r\n        overflow: hidden;\r\n        text-overflow: ellipsis;\r\n        white-space: nowrap;\r\n    }\r\n    \r\n    .selected-payment .icon-payment {\r\n        flex-shrink: 0;\r\n        width: 24px;\r\n        height: 16px;\r\n    }\r\n\r\n    .accordion {\r\n        display: none;\r\n    }\r\n\r\n    .accordion-body {\r\n        padding-top: 0;\r\n    }\r\n\r\n    .accordion-button:not(.collapsed) {\r\n        box-shadow: none;\r\n        color: var(--wallet-primary-color);\r\n    }\r\n}\r\n\r\n.add-payment-container {\r\n    width: 100%;\r\n}\r\n\r\n/* Collapsible Container */\r\n.collapsible-wrapper {\r\n    overflow: hidden; /* Important for collapsing */\r\n\r\n    &.accordion-item {\r\n        border-bottom: solid 1px var(--wallet-border-gray);\r\n    }\r\n\r\n    &.accordion-item:first-of-type {\r\n        border-top: solid 1px var(--wallet-border-gray);\r\n    }\r\n\r\n    .collapsible-header {\r\n        display: flex;\r\n        justify-content: space-between;\r\n        position: relative;\r\n        width: 100%;\r\n        cursor: pointer;\r\n        padding-right: 14px;\r\n        \r\n        /* Add dropdown arrow with base64 encoding */\r\n        &::after {\r\n            content: '';\r\n            height: 10px;\r\n            width: 16px;\r\n            display: block;\r\n            position: absolute;\r\n            right: 0;\r\n            top: 50%;\r\n            transform: translate(0, -50%);\r\n            background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAOCAYAAAAxDQxDAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAGqADAAQAAAABAAAADgAAAADZqYdIAAABMUlEQVQ4Eb3TLU8DMRgH8DYXsuBOtGNkFZ17buokEtwkEkf4BuMTMNzc7BzYuTmYGkgUDuoI7hL6ATBb93SXJveyl3YhNGmeu+T6/93T6xHyTyMKcQBAMtYccc6k1votZK03ZBFC6BzDz3H2OD+Jtf6Z4bXX8IIKiCTE3FBKv40xfeyOIPbqI+2FqohS6hG37Zkx3kHAG9sJSSnjKDp6opSA7cQi7u0Rm4ZgWyGLNBrHc0RSnLeIjB3iagi2ESoieADulfocuvBq9cVqUB35GFTDq/dCiJfFYtnD7b3adkBqUKt1ar/JWd7JfsSiWZb9CtGe7MJKEED3AdddhiCuOx9s/axFABKDdeAWH1LTNI2TpPueZ8F1KeOvEBdqMYS+ihjNOzB3h2yXC95Uyz96dLECyBWVlYgWbxwAAAAASUVORK5CYII=);\r\n            background-repeat: no-repeat;\r\n            background-size: contain;\r\n            transition: transform .3s ease;\r\n        }\r\n        \r\n        /* Rotate arrow when expanded */\r\n        .collapsed &::after {\r\n            transform: rotate(180deg);\r\n        }\r\n        padding: 18px 32px 18px 0;\r\n    \r\n        h3, p {\r\n            margin: 0;\r\n        }\r\n\r\n        h3 {\r\n            white-space: nowrap;\r\n        }\r\n    }\r\n      \r\n      .collapsible-content {\r\n          transition: height 0.3s ease;\r\n          overflow: hidden;\r\n\r\n          >:last-child {\r\n            margin-bottom: 24px;\r\n          }\r\n      }\r\n\r\n      &.collapsed {\r\n        .collapsible-header {\r\n            &:after {\r\n                transform: rotate(180deg) translate(0, 50%);;\r\n            }\r\n        }\r\n        \r\n        .collapsible-content {\r\n            height: 0;\r\n        }\r\n      }\r\n      \r\n}\r\n\r\n.footer {\r\n    display: flex;\r\n    justify-content: flex-end;\r\n}\r\n\r\n\r\n\r\n* {\r\n    box-sizing: border-box;\r\n}\r\n\r\n/* Utilities */\r\n.w-100 {\r\n    width: 100%;\r\n}\r\n\r\n/* Form Elements */\r\nform {\r\n    max-width: 100%;\r\n    box-shadow: none;\r\n\r\n    div {\r\n        margin-bottom: 15px;\r\n    }\r\n\r\n    h4 {\r\n        margin: 0;\r\n    }\r\n}\r\n\r\nlabel {\r\n    display: block;\r\n    font-size: 12px;\r\n    font-weight: 700;\r\n    line-height: 24px;\r\n}\r\n\r\ninput[type=\"text\"], select {\r\n    margin: 0;\r\n    width: 100%;\r\n    padding: 10px;\r\n    border: 1px solid var(--wallet-border-gray);\r\n    border-radius: 12px;\r\n    font-size: 16px;\r\n    font-weight: 400;\r\n    background-color: #fff;\r\n    transition: border-color 0.3s ease;\r\n}\r\n\r\ninput:focus {\r\n    border-color: var(--wallet-primary-color); /* Highlight border on focus */\r\n    outline: none;\r\n    box-shadow: 0 0 5px rgba(232, 241, 251, 0.5); /* Add a subtle glow effect */\r\n}\r\n\r\ninput::placeholder {\r\n    font-style: normal !important;\r\n}\r\n\r\nselect {\r\n    appearance: none;\r\n    background-image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNiA3QzUuODEyNSA3IDUuNjM2MjUgNi45MjQ3NSA1LjUwMzU5IDYuNzg4NzNMMC40NzgxMjUgMS42MTc5QzAuNDExNTYzIDEuNTQ5NCAwLjM3NSAxLjQ1ODcyIDAuMzc1IDEuMzYxNzdDMC4zNzUgMS4yNjUyOSAwLjQxMTU2MyAxLjE3NDEzIDAuNDc4MTI1IDEuMTA2MTJDMC41NDQ2ODcgMS4wMzc2MiAwLjYzMjgxMiAxIDAuNzI2NTYyIDFDMC44MjAzMTIgMSAwLjkwODkwNiAxLjAzNzYyIDAuOTc1IDEuMTA2MTJMNiA2LjI3NjQ3TDExLjAyNSAxLjEwNjEyQzExLjA5MTYgMS4wMzc2MiAxMS4xNzk3IDEgMTEuMjczNCAxQzExLjM2NzIgMSAxMS40NTU4IDEuMDM3NjIgMTEuNTIxOSAxLjEwNjEyQzExLjU4ODQgMS4xNzQ2MSAxMS42MjUgMS4yNjUyOSAxMS42MjUgMS4zNjE3N0MxMS42MjUgMS40NTgyNCAxMS41ODg0IDEuNTQ5NCAxMS41MjE5IDEuNjE3NDFMNi40OTY4OCA2Ljc4ODI1QzYuMzY0NjkgNi45MjQ3NSA2LjE4Nzk3IDcgNiA3WiIgZmlsbD0iIzIwMjczNyIgc3Ryb2tlPSIjMjgyODI5IiBzdHJva2Utd2lkdGg9IjAuNyIvPgo8L3N2Zz4K);\r\n    background-repeat: no-repeat;\r\n    background-position-y: 50%;\r\n    background-position-x: calc(100% - 16px);\r\n    background-size: 12px 9px;\r\n\r\n    &:focus-visible {\r\n        outline: 1px solid var(--wallet-primary-color);\r\n    }\r\n\r\n    &:hover {\r\n        cursor: pointer;\r\n    }\r\n}\r\n\r\n.custom-radio {\r\n    cursor: pointer;\r\n    position: relative;\r\n    padding-left: 28px;\r\n\r\n    input {\r\n        display: none;\r\n        position: relative;\r\n    }\r\n}\r\n\r\n.custom-radio::before {\r\n    content: \"\";\r\n    position: absolute;\r\n    display: block;\r\n    height: 18px;\r\n    width: 18px;\r\n    border-radius: 50%;\r\n    border: solid 1px var(--wallet-medium-gray);\r\n    left: 0;\r\n    top: 50%;\r\n    transform: translate(0, -50%);\r\n    background-color: transparent;\r\n}\r\n\r\n.custom-radio:has(input:checked)::before {\r\n    background-color: var(--wallet-primary-color);\r\n    border-color: var(--wallet-primary-color);\r\n\r\n}\r\n\r\n.custom-radio::after {\r\n    content: \"\";\r\n    position: absolute;\r\n    display: block;\r\n    height: 6px;\r\n    width: 6px;\r\n    border-radius: 50%;\r\n    background-color: var(--wallet-background-color);\r\n    left: 7px;\r\n    top: 50%;\r\n    transform: translate(0, -50%);\r\n}\r\n\r\n.error {\r\n    color: var(--wallet-error-color);\r\n    font-size: 12px;\r\n    margin-top: 5px;\r\n    font-weight: 700;\r\n    display: flex;\r\n    align-items: center;\r\n}\r\n\r\n.error:before {\r\n    content: \"\";\r\n    background-image: url('../../assets/icons/danger.png');\r\n    background-repeat: no-repeat;\r\n    background-size: contain;\r\n    display: inline-block;\r\n    width: 12px;\r\n    height: 12px;\r\n    margin-right: 4px;\r\n    margin-left: 2px;\r\n}\r\n\r\nform input.error {\r\n    border-color: var(--wallet-error-color);\r\n    box-shadow: 0 0 1px 0 var(--wallet-error-color);\r\n}\r\n\r\n\r\n/* End Form Elements */\r\n\r\n.api-errors {\r\n    color: var(--wallet-primary-color);\r\n    background: var(--wallet-error-background);\r\n    padding: 12px;\r\n    border-radius: 12px;\r\n    position: relative;\r\n    display: flex;\r\n    gap: 8px;\r\n    align-items: center;\r\n\r\n    .error-content {\r\n        margin: 0;\r\n    }\r\n\r\n    &:before {\r\n        content: \"\";\r\n        background-image: url('../../assets/icons/warning.png');\r\n        background-repeat: no-repeat;\r\n        background-size: contain;\r\n        display: inline-block;\r\n        width: 20px;\r\n        height: 20px;\r\n        margin-right: 4px;\r\n        margin-left: 2px;\r\n    }\r\n\r\n    h5 {\r\n        margin: 0;\r\n        font-weight: 700;\r\n        font-size: 12px;\r\n    }\r\n\r\n    ul {\r\n        margin: 0;\r\n        padding: 0 12px;\r\n        font-size: 12px;\r\n    }\r\n}\r\n\r\n/* Typography */\r\n.small-hero {\r\n    font-family: 'Mackinac';\r\n    font-size: 24px;\r\n    font-weight: 800;\r\n}\r\n\r\n.text-medium {\r\n    font-family: 'Inter', sans-serif;\r\n    font-weight: 400;\r\n    font-size: 14px;\r\n    line-height: 150%;\r\n}\r\n\r\n.text-medium-strong {\r\n    font-family: 'Inter', sans-serif;\r\n    font-weight: 700;\r\n    font-size: 14px;\r\n    line-height: 150%;\r\n}\r\n/* End fonts */\r\n\r\n/* Icons */\r\n.icon-payment {\r\n    height: 19px;\r\n    width: 30px;\r\n    background-size: contain;\r\n    background-repeat: no-repeat;\r\n}\r\n\r\n.icon-visa {\r\n    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAXCAYAAABj7u2bAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAJKADAAQAAAABAAAAFwAAAADMjyGqAAAFGUlEQVRIDcVWbUxbZRR+7kcLF+gKpXwMKGMwtqWiMWxjymK2ZJnGaTRCYojRxSUmYsyyRN38oTGZiRoTMTMmRrIEh1Hj/gDqHyKRgcxNEBYYg7HC+GjGoLS0tBT6cdtez3vbu6ywzMQonLT39p73ve953uc857zlQNbe3v5BeXl5vSzLHD0qzLfBJhiNRl9jY+MJrqWl5VR1dXW9yWQqVpTNwKJuneN5Pmaz2bq4sbExWymZTqcTNpiVdeF8Pt+yGI1G+RgZsSNsIkMghhCJRMATzE3L0zqKCIvIWCGC1O9mMsRxHFh8xtB/bgLPgdb/Vyaytxgy7QvQSjy52YJaE4hG2CywQLygvoIY+bTfCv2OxBTE64JDIChD0lONCBxkOcpCJMbi+9fmqwOJixY/GRAEcLILvLsNvLcDnOKCkloJ2XIGOn06ph1evP/jAPyhCM68WIlvLtpwbcaDhmP7UFmWi9Y/p9BEvjvuVWKIw2uHd+L1J620LwU/9U7jq44xpIgCPnlpD6yWrLtgGSYmG2a8hky9x2TEBAOUnDo4t7yJ4ZkwONc58P4BNcDvo/P4oeMmnN4gMlIEtP01g97xBRBxuHBpAi9/2Y3+SRfSUkSshiNw+0Pqe3NuPz5uHcKvfTP45fIkRuwe1Z8UO5GlZIbICY6njwQh8wA+sn2Ipwxncbx0GAH5oAqAT9Oh/shOeCiYPxjBI8VZMEp6fNs9gVVi7o0ju/DZq/vh9gUQCFG6lCh6bjhwdWoRFWVm2OZ8uH7bg1oqccYcZVo1Ddx6URMoORpFtkFAkTkTp7oPY3A2G3bHIjpH5rEj34jax0owensJHl8IRdnpyM+SUFGcycSI7y9N4p3mPhVMYU46QsRU08VxSDoRJ49akUL9t39iEWFVW0ykyZacsgRtKloS6qHdWfDJmfiix4Sm30bgWwmj7kAJ0qVUTC0sQwmGUZCVBilVj7efrcDp5x9WV2/4eRi1n3fC6VnF5ZsOdFOqj1YW4YV9xSjNNeCa3Y3lgEz4Y3eLSWNofcoSgENyBPt3mFGSI6HzhhvBcBQF2RKeebQQIAbtrhVAL2IbscDSYs7Q49NjVXiaxo9//QeGpt1qqrpGHQhSKsfuLOHE+V5VVyvqsxfV5TmIJsT8j4AoJkzpelRuN6G1zw6Zkl33eAn2EsgF7wqmXX6k0bi1MBPnO20Ysi9hD82dpQrzEJN5xjRV2O1Ds9hC86JRBVcnF6kAOIQjMfTfcuGJ3XlQIvG2wAAxE7VySxCTfKNJh6z5uNAzBUnSoabKQi2Kx/xSgDTkRSrpYVfBFnSNzuFs2/V436KSs5LQ333uIdxyLGOcxFx7sAwNr+ylPsajhTZ38twVXBl34q01pxYDxQ0ODo5bLJZter1ep6HUULHdsPKddq5ApCZXmptBdx4BSt+M0682yrI8A5ZWwwQyiMXlEDVEERazhCJTuqoz76qMrZkStpLwmbHnyQVil9pGiTmDqizODDtcvV6v74GA2FzWnfXECrMQ0Uv/C1TaWbVQf0dIjkGkOQwoe6ZDg3TBKpX8tAmRneKkE5nSxIyxxNZj67D1WANlpgGKnwPk0ESljt5zYYsHwvHFNDfbVYCY00wmfTAAa02OkB/Jfibie9fTssLuTD7qaa+B0QbXLrwRz1psBkj9Y6aB2ojg94vB4hNDnGgwGJYoj9u1XN5v8kb5qLAUsbm5+XRNTc17ubm5VQ9sAf8vKo7AyAMDA9/9DXQ66jknXnjWAAAAAElFTkSuQmCC);\r\n}\r\n\r\n.icon-mastercard {\r\n    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAXCAYAAABj7u2bAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MDUxOEQ3NDIxOEI2MTFFODlCNzNGQjk0MjMzMzZCQjUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MDUxOEQ3NDMxOEI2MTFFODlCNzNGQjk0MjMzMzZCQjUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDowNTE4RDc0MDE4QjYxMUU4OUI3M0ZCOTQyMzMzNkJCNSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDowNTE4RDc0MTE4QjYxMUU4OUI3M0ZCOTQyMzMzNkJCNSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PiK6ZGcAAAbmSURBVHjaxFZbbBzVGf7OzJmdnb1fvL5unI3tOIFYCWkMUUybmHIHqSqiLzwgoT60DSBACogXKmhVtVJbpD70DfUJVY1EQJHahqsaaGkKIVwSk+LEOInja+K9xevd2Z3b6X9mHTdx7TpvjPTvzOzMnPP93//9F4bhl6Dr/PeqwvYDUPANHQJYdBxvPzc09dehgPb9WFhX2DeFhjZuWE6oVKk/wVWIHzLPSdWq3urIGYPLFNhkHl0L+lr+qkKAC9c/M7Kml/SuYHA8xT/Lv6WTCqN3FQ+qIigEYi1QCofYyZnreQ3T8+gPdSWHdZX7G/aYRdxdGMPOygwijoUK13Ei1oV3032YCCZ90MwWPoCu6CKGN07h1rY5JIwG6jbH6UIa701swFgpBctVYGjOWlx5HJ50sQngWjAmgeldLODAxQ/x6OznCHrXL/LY9KeoqRr+0DmI33UMoZbS8fiOk/jR9hGkDRMy/pIZCVKyVR/iODzWi5eP78KXBNBQ3SZ9K4mK7/3pJXqQputlhmpKAENXJvDK6GFsruXXlcDJvizKB1qwr3sSVp37AFYeMlv0gI0LpTieeW8YR8ZzxJS9EpOpGt17nyNHQmTSIViM46bFyzj05UFsqpduSJPt+gJy+TwaKQNeCyfiV80iOK6KTMjEd3OTOD7VhgvlGDRGapFaa5qjMJIPhc03eRlwbPxq/B1kG1fWR0Juu7uDcAbDcIlVVMS6hcN0OFojVfxi3zGkdBOOVMLS/tIIEP0QEmk10vm9xTHcWR6/sXTVKJM2Um60q/A2cChjFtg5m0DJxS2ixV31swYJ/bauaXyvb5zSXV3eXxqXgCShHqV1iDLo7uLX0ARRFYuSxxUgHCYa6N40/3dlnZwZacgdSIHc95DFXLg5A0JrpxhVIWxag6nNYuMHjvmx4cEg7umdwRune/xQEjP+kmq4cw9pSIToVkk4dTx78R9Y6OpG8uAfMbYooP/sRWiRMNj8PMB5E1j/ZpR2DUE8eT/UxBng9puIpRrY9gxq8RRKtzwF9eYXwJQguEM5Q8wzykimRaAQ8LyTA3qeRNo7hUMnEqhYOmWU1JJwuCxyzZQXMFwbXY0SPvzWw0gODWPeCtPCPXAXiIUHfoBW1/SLYZVpuGRRat7SD5dvQ+KOYRT+/i9UEq3IJEKw02n8+8iLJMgU2gdfQRBF2NU84h1bUbg0S05sQSBaRev538Cg731mWbPuKMylG++qebAJWCS3Aee+OIPeLVk40zMIT09ibraIuUwWJ402lC/OQq9VUT75Fszv3IV3R6Ywt3UHzNYM/nmxhFzgIwworyGqWzh/fgYFZyMW+ABOjRaRidk48tpBNBbmqPJeJh7Ua/YXUkPe1XZCUmE4xdJI5bqgFfIolObhxeKY2ncfgtRk2kQVs0c/QO3RRxALkpg/fh+1Kza2Tk6hUpxHb7CB02+dQPHBp7HQ+zLmvTtJiiF4ahSl+TzOjX6FgS3fxt57shD1rzC7GIVFTFO3IIaWcLRvf+YSndNCKo9Q/XjqGO7b00+xd4hoDh4yUBAc6e4OKlINONE4jMkJlCldezscHKeP+0lTdnkKN2sXkM9/gmOd+7GtL4WzZyfQ0d5CIalDd+cQNj/BWfEQ4rEIBlNHcfREEQcODVDvowxV/JCZy1kmGaqoOsaj7bjtL6+uaGxrd+lt3XS2lyjWgNQLLehN/xbC9LB7EzVbv03KJk0FKqZhp/ilX4HdhooPRvehYgYQ0e3lYrocMnlEvAbeCefwdrQPD1S+vqEhxosH4N5hkB7oOkkTQYwyihgVtH/DW1GqfRJCMAjAsdFOvDmSRUh10CRlqdZKQEw0TWaQHCVearsd5wKJG6qNyhkb2p8r0EoWvEGdXKR9vbXfD2oupgsR/PyvO1AzVaqtzvL+0hQJ4KrCZfoFXAfntTh+0nkvRoKZ9RE1BE5dSONvmU0wwi6C1MVV5fqZR4ZI5x6MoI3xyzE8/afd+GIiCZ3YgSeuyzI11nLrcz6P13QhTkintBjejvSQlgTaqeLGZCtYcUzSO68mB/B8xzDeuNyDK2UNHXETMcOGEbKgERtaQIZEwWzZwOHPNuL51wfx+WTKZ2qV6cNh2S2PUwlG8trx479Pm5PiZiqWe2ozyDoLiLgWFtUAJojFj0KdGAskERRyU0oRW8WGZBW7e/LoyVSoNFgwLY7pcgifTlCxnEn47GnqmjGts2z/E9MUvM7/FxWLKoJJY4mcDAOkM3mvEItBug6saKAOTYQSmKxpAQqT7bIl7XgUNnddAajRjl2zTLBNcqzBqjMc/LDJzSUTnDRn0FmX8/Qq87GsJ1IvMiRyjpZApHFFrAfGJi9f/48AAwCK+xeAoUA+KwAAAABJRU5ErkJggg==)\r\n}\r\n\r\n.icon-amex {\r\n    background-image: url(data:image/png;base64,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);\r\n    background-position-x: center; \r\n}\r\n\r\n.icon-discover {\r\n    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAXCAYAAABj7u2bAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MDUxOEQ3M0UxOEI2MTFFODlCNzNGQjk0MjMzMzZCQjUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MDUxOEQ3M0YxOEI2MTFFODlCNzNGQjk0MjMzMzZCQjUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpEQ0Y1MjI3NTE4QjUxMUU4OUI3M0ZCOTQyMzMzNkJCNSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpEQ0Y1MjI3NjE4QjUxMUU4OUI3M0ZCOTQyMzMzNkJCNSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PvCOXowAAAR/SURBVHja7FZtSGRVGH7uuXdmd0QlP9YUl/CbBXPxj7TCEigmakgqISj+VlsEUUTTrSyF/kg/9EdgYZqCxNYfkxQxSWFEU2eWxRxmLd3ZFTUdnRmdwVmdr95zZhSzNVvYLX/0wuHec8/X8z7vc973SpIkYXR0tCIhIeFDl8vFAPjwLxthkENDQ7e7u7urpeHh4bfT09M/jYqKusHH/gtA/FzGmMdgMHwPo9E4Tcwc+S6B7e3tmZnX6w2i5sUlMIIhMQJ2KcAEzMdwyex/QBeZcrqzu7uLmpoanhdQUFCAiooKtLW1obi4GH19fbDZbGhvb4fb7UZLS4vo3/3oE2QmhgI/fUm70XZvlOLriSWoZYaysjKMj49jfn4epFXMzs6ipKQEGxsbmJubQ25urmixsbEICgr6K0M7OztYXl5GaWkpBgYG0NnZCb1ej97eXszMzKCqqorfBFRWViIjIwPv3/0Amv0nwDe1gH0bCIkC9N/imu0hvhoYFMD5Wo1GA61Wi5ycHOTn54u9+LOnpwdms1mMnxuyyMhIFBUVob6+HmNjY9jf30dhYSGSk5PR1dWFkZERAaq2tha3M28hPeIIWPsFuJ4GxN8CDpzITYtGSHikcMjpdApWOEN87cLCggAwNDSExMRExMfHi4icC8jhcMBkMgmqU1JSxEZqtRqtra2gBIqpqSnhuU6ng9Vqg811lS6rCzBOALp7wGM9lGuv4V0C0dDQgOzsbMTExMDj8aC8vBxUFcQ+6+vrCA8PF2N/EjU/8NiCg4NJBgqampqEPhobG5Gamioorqurg91uFxqrrq5Gc3Mz3rtzB9M7auCdjyneJj+o5NvAjVy89WYmsrKykJeXB1mWhU44K1xHcXFx6OjoEMB4KE+SkMQgLS4u6pKSklKvkHHP19bWhDecTqov2NzcFGGkEiOEx79zW1lZEZcg9fU0+k4a+H0ZcDvhi71JBVGCx+2CxWpFRESEmL+1tQWLxYKwsDDhNGeHO3h4eIhoYokHbd+0ZBOA6BABiLPFvRFo6Z1rhff5+3GcOVhuZ+ch0IeXGA8kfz7n7PxTZUI4LPY8sIFpv4Br9p5T4RvyxhceP0/b2f65358x7/Sck3fumETgKC2AcDP9d5B/7IRk0ML36nV/HuJoj4G9VJNVlKsIyFMnmGEK8sRnYMZJ4NANqPm4AoWDOW4vDRCjsNNNlfbMkA2jUH4eBFsaEwyBR/IKp9D/J3bC0AsFRLcFitr/9Loh7T6Can4Q8uIPYKYFEn8AhPyM0vFCGaKQ+FRXIXlcYOYVsLX7UN0njRjHIDnsfhbUATB/U8tkAiI9r4Z4zvALlImQ8BzLdlagWp2GsqqF/OsU2MaqP/XKgaZctKlPUii3bBKQtH8EiCn0B6WIMODQAenoAMz6BKrfJqFangTbegjJtgk4A0yoTh92wd86JXumCXEr/f39TVTNndHR0TkUNuXcZQRWcVqY2rEtK9ZHkrzxAMr6AzDLY0heDzw+apTefK9QKQiTn09y5KasDnk6q7r5+R8CDAAQ+7+xgJtQtAAAAABJRU5ErkJggg==);\r\n}\r\n\r\n.icon-diners {\r\n    background-image: url(data:image/jpeg;base64,/9j/4AAQSkZJRgABAgEAZABkAAD//gASTEVBRFRPT0xTIHYyMi4wAP/bAIQABQUFCAUIDAcHDAwJCQkMDQwMDAwNDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQEFCAgKBwoMBwcMDQwKDA0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0N/8QBogAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoLAQADAQEBAQEBAQEBAAAAAAAAAQIDBAUGBwgJCgsQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+hEAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/8AAEQgAFwAkAwERAAIRAQMRAf/aAAwDAQACEQMRAD8A+srK0juY/NlBd2eTJLN2kYAAZwAAAAAAABW8pOL5Y6JJdF2RzwipLmlq231fdmF4k1G00GN5XAjjgjEs0rCR9qu/lxIkaupkllcFUBZVUKWY4wD0UYSrNJatu0UrK9ldtuzskt9G3eyOWvOFBNvRRV5N3dk3ZJJNXcntqkrNs5nXfEDaHLP5Xl3o06OGe7t2R4Zhby8edbyrIY3Kfxxug/3xkZ66VH2qje8OdyjCV1KPMvsyTV1fo0/kctWq6Lly2moKLnFpxlyv7UWpWdrq6a+Z6PaW9newR3MK7opkWRDlhlXUMp69wRXlyc4ScJbptPbdaM9WMYTipxWkkmt9mroybqeSwmeKBiqZBAJ3Yyq5xuyQM84HGST3raKU0nJa/d18jCUnTk4xen39F3Hf25BpEKrOshHl3VwzIoYJFBMolduQ3y+arYUMxXcQDjFYVPi+S/JHTT+H5v8ANmFr1zo2vxMklxAyTRBJoZJCgkjVhKjK6bikkLMHWRQ4UPh1wykbUazotNXTTvFqzabVno9GmtGtPJmFegqyadmmrSi7pNJ3Wq1Ti9U7Pdprtg6xpsPiKR/s7wwrqrRWdxLDI09zKkMbTfZoldIorcGNHklkdiSv8BO0V1U8TGio7zcG3CNlGKlL7Undt26LT1OWphpVnLaCmkpy5nKTjG3uxVko3tq9b9jtYPE2mabbpAN0K28gtPKIBePyvkywDN8iqA2QWO0hsdceZKTk3KW7bb9Xqz1IxUIqEdEkkl5LREepSLLOzoQysEKsDkEFFIII4II5BHWuyn8K+f5nDU+J/L8jN1GNWmiWSWKBrfzVdZLfziyyTK/ysAwCuiqcZ4dY2dGClDk6cpvmgrppdl0t1NY1I01yTdmm+j6tvp5GCdMj3oRc2gVd4J+w5YCSJEfafLAALKWZSMSJtjbgBhPsZ9vxX+ZXt6f834P/ACLbQs27F3aKWeOTiyb78YiUMSVL7giyhGDhkEqrysfznsZ9vxX+Ye3p/wA34P8AyIDYRqd6XFlv3lwzWTBlB38blUZYblbzCu5irKwKPhT2M+34r/MPb0/5vwf+R2C2rah+9tsGIBUU8KDtRQSFAGBnIA2r04UDFapqmlGW/wDwTJxdVucNvu2R/9k=);\r\n}\r\n\r\n.icon-upi {\r\n    background-image: url(data:image/png;base64,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);\r\n}\r\n\r\n.icon-jcb {\r\n    background-image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzciIGhlaWdodD0iMjMiIHZpZXdCb3g9IjAgMCAzNyAyMyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CjxyZWN0IHg9IjAuNSIgd2lkdGg9IjM2IiBoZWlnaHQ9IjIzIiBmaWxsPSJ1cmwoI3BhdHRlcm4wXzQxOTU1XzEwMTkxKSIvPgo8ZGVmcz4KPHBhdHRlcm4gaWQ9InBhdHRlcm4wXzQxOTU1XzEwMTkxIiBwYXR0ZXJuQ29udGVudFVuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgd2lkdGg9IjEiIGhlaWdodD0iMSI+Cjx1c2UgeGxpbms6aHJlZj0iI2ltYWdlMF80MTk1NV8xMDE5MSIgdHJhbnNmb3JtPSJzY2FsZSgwLjAyNzc3NzggMC4wNDM0NzgzKSIvPgo8L3BhdHRlcm4+CjxpbWFnZSBpZD0iaW1hZ2UwXzQxOTU1XzEwMTkxIiB3aWR0aD0iMzYiIGhlaWdodD0iMjMiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiIHhsaW5rOmhyZWY9ImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQ1FBQUFBWENBSUFBQURzakhyTUFBQUFBWE5TUjBJQXJzNGM2UUFBQUVSbFdFbG1UVTBBS2dBQUFBZ0FBWWRwQUFRQUFBQUJBQUFBR2dBQUFBQUFBNkFCQUFNQUFBQUJBQUVBQUtBQ0FBUUFBQUFCQUFBQUpLQURBQVFBQUFBQkFBQUFGd0FBQUFETWp5R3FBQUFIZVVsRVFWUklEUjFXVzR4Vlp4VmUvLzNmKzh5NXpBMDZ0b1lVZytJRVM3aUhWcUsweEFLaDJHcWlSckhXU0I5cW9qNW9USGxvYmVLMWZUS3BNVDRZMHBTYVlpaHRwYVdsdEZCaUtEQ0lTQnBvSDJ4czBtaEJ4aGxtbUhQMjliLzQ3ZG5uWkdkbjczLy9hNjN2KzlhM05xdGpESkVraTVHWTl5UUVjV3FPbXNnUnhjVy9wbHFTNThHU0N5UktjalhGbEFKdkxpUW5HUWl2SytzcENNcUlRa1hjVTVURUhJV0NzS0hzWVgxRkV2c0pSand5NTZtL1FPK2NuZksrSkNVOEdaRWtQZ1ROeTN1L3NKWUhUODdSM00zM3pwK21xckxjaU1xM2hJcUNUYnRpY3ZjTzVGWlFYZFBnL01Vek5Zc1NoMkF1bERFVnJGRGJKM2NpS081UVdDemhKei82eGZHVFUyT2Z1TFVJdFI1cWt4NzJUQm1wdXJxODcvUHJxUmI3SC8zcCtXT3ZqNm1rbzAwM1RWUlZkbEd0RUhQdDl1U1h0cEgyVHgzNDdWOU9IRjc2eVZIQm81QitLRlhHTUJKVjIvVysrTm5OVm94Szd3c3A3Sk5QL09IMDIzOWZNcjZNV05vWnRsNG1YbmUwYXZISWpjd0E2S0dubjc1dzZzVHR3OE5MZGNmV25pT1MwRXU0S0JrWE5mQU16eHgrOXZDcGwwZVdEWmUyVWpMYWxoYUdTRmJHT0RZb09TTkF6UVZqUVBMZzh5K09ERThvcHR1dERubUdteXc2SVpoWVBJalJHMGVQSkVuQ3VGd295OXpoTlMybEJTSStjQ0UwZG5qeDFLdGkzT2hFcElrT1BBUVdndlBSQnhlOFk3NG1UNXpoSjdDMHFuR1h4OGlLUEYrTUZLU2l5ZzljZE40N0xNZ1hGaFFUa2J6V0VvcEFEZzRVTXNXVjhnNjA4NndlMkZUbmcvbkJ6WGxya1VmZ25JTTRRdHFvQ09LQU1wd1hFYlJKalJkSTRKRTNYSUxHMm1YS2NoZHFxVGlDV2JDN0tDWHZGd1FOV0tOV2lzaU9SQVRuTWFSTWhyeE1KQ0ltbkVsa1VJYktRZWtNR2hSUUI0UXRKV2NRTUxJQWNqNEd5WGxWRjFHR0twdk44aGxqeDcxcFVIS2MzYWc4dEpPRXJDMzRyQ3U2TXBtTElta1JtUVRCcWh0NVdaVytsem9lV0Qra2JSTXJnQ21VcVpDVlgwd09ZWnNBQ2hnRFhVQXFaRjFuYTlhc2ZQQzc5OC9uZzdSOTJ5OGZmNHcwVFlkcTkzY2UzckpoNDVMYmJ5VUxpRU9qOC85OGVQVWZsMTc1MHdzVS9GT1AvbXEycDNxalEwMjVqSUhacXM0dVhIbjdieCsrMWpNQUI0VTRRQmtvY3UrUU9oTWFqWWtzL05oSWUzTDVXS0N4UWRPUzRJUmVPM3VPRUxOeUg3eDE3T3dieDExV2pBOTNOcXo1M01UYXRmRzVRNkIvOWFwTk4yWDh6ZTkrbmJaVEs1SzllNzZuaUsyYVdCN09UVis1ZEFYOGNQUjJ6Y0lpaTB3eW5wZE9HMVhXRmVLQ29RaTdFRlRXU0FNRVNTckxTOGVQLzNIZlk1L3E5aElTbWJablRsMWdVb3kxMjBTS2FtVWx2M2p4b202cFlkdlRld1RxOEtTdmZUU25XRGMwdnNSbEpHQ012UnhzeTJwZXVTeEpWVkgyV1NURmFCQkptNlQyQkNCSWk3K2VPam5lU3NlVTFjNFBFN01tY1l6ZjVJcmdlQXdRK1dmMlA0dTlEQWxIbFNKOTdNU2JNLy9OckVvRjdrVU9rVGpzTXpON3ZkK2Z5YkpaSHZPOGY3M2RnaGZpTGZRR0tzdFFPZ1dvS0c3YWNoZjZiS0hJb01LNU1yc1c4bXN4cjdBSXFWRmVVLy91YjIzZDlZTXZiMzlvKzlUbGM5RDQ3bnQyUGZMd0Q3TStqQmNLcDBieWRSa3VYNzUwNU1qSkMxY3V6eTdNckZpNTlwSHY3L0dNSEtPVFo2OVdhS2ZHandOV2I5cXhmWmxuRjE5L015NE1iaHNkVzczK0RsbzUrZnNmN3lNb1M2RzZjTy9PN1VtdjFXSEpIYXRXRlpRN3lvemxqU0VqZC9RYWkwSXIvdWVqcjI3ZXN2V3IzN3hidDV0S3I4N1FCLythUHZITytiZW1MaTBibVlCZFBiQmg4OTZISHR5OGJ0MHRkMjdjZWM5V3FvQ0lvL2Zlbno4ejFlMk1JdGk3NzU2YjZZVnY3UDU2VnVkSllxNWNmejlWN09yMFAxODUvYndkc293SzRnbXFneExvWjQvL2ZIUjBmOVNSZ1E0dWJYY2ttQ0dlZEZ2dHBTeGdwbEJQbWFNSER4NDljTUFvS1Yzc0NUUGs0b1JLalVrQ09CTmgzNU5QZkd5TDRYYUhLNllTSVV4SUxKbWhXdmRLS2RCcnVZbGRHVVVnSjBhR2JobHJUNFRVaFVSdzNRN0dWckFhbUNFMUNUVGtjZDZTckdkTlNxd3RkRkt5cmxJaklzMjhyeFdCQ2phU3lpRXBEYmVHUitWMVFoSnZReXFKeWZ1dUVRakVqOEhIMEVvbEtGRUIvYzFNN2VFdVZpcXM1UkVHSDVwZWE0eU9NZWtxVVZlbXF0c3hRcU95cUpMR3pMRkhWZktxZ2w4SzczZ1ZSQmxFSFlSamdpL01GKzNXQ0tRZllKYk5UdEFhb0lSZGlzUUZLMlhiZWVVS0hwelFUREVZTVRLQmR3ZlBrQXlHYVNnaVBCT05DZzNKVUdNc1MyU0RoemdUZzdIRGZJRUo5RnhUMTR6SFFpc3lzSHdlSXN5ZWxFVm5sSlhEZUtJaXo0emdMU3VGSytabS8vMlZCM1pnMXloRTFjejcyRGlkdGs1Z3lnVU1nbyt5bSt0M2JRTUVNTUxvZUFRUU1BRWc1SlYweG9haDRuOXgvZVNkREYwUFg0QTc0RDk5NDJOaE5ERGtnMXdvMjU5ZkNBTk1SSC9mcnAwN2RxNmduR2I3Zlc0bEJLaXI0RXlyeHRobzNONnQzcmJsMDN1L0hRM05nejB1cWdvMkh6WElpNVpDNkZmbFhadTIzTC81YTJEVlZXaUJHT0ZNTHp4M3pOcE9KUU5UOEhnWXMxYXBYcmR4SlJSbFlSMDFuWDdwVUNLWmNxR25rekFvVXFtbFVDTWIxOU53aTVLWXlmalNoWk9aSzlwQ1luakNQbXFYTCtuMFByTjh4UkIxTmFXR09qQVlGbUowdFZlTEl4VHpESjg5SUFObmZDZ0JQWWdESDA0R1FBZUkxbUVtTkJmQUdrZGNQT01rbzJNTlFiaUZ4NHNmUnVoaFBJYlNtbDBrS1FrVEQvUi9PclBDZUZVM21qNEFBQUFBU1VWT1JLNUNZSUk9Ii8+CjwvZGVmcz4KPC9zdmc+Cg==);\r\n}\r\n\r\n.icon-echeck {\r\n    background-image: url(data:image/png;base64,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);\r\n}\r\n\r\n.icon-carret {\r\n    background-image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTMiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEzIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMC41NTYxNTIgNy4zMzM2NkMwLjQ1MTk3NyA3LjMzMzY2IDAuMzUzNTMxIDcuMjkxODUgMC4yODAwODggNy4yMTU3NUMwLjEyNzk5MiA3LjA1OTI1IDAuMTI3OTkyIDYuODA0MTQgMC4yODAwODggNi42NDcxMUw1Ljg2Mzg5IDAuOTAyODFDNi4wMTEyOSAwLjc1MDYgNi4yMDcxNCAwLjY2Njk5MiA2LjQxNTQ5IDAuNjY2OTkyQzYuNjI0MzcgMC42NjY5OTIgNi44MjAyMiAwLjc1MDYgNi45Njc2MiAwLjkwMTczOEwxMi41NTE5IDYuNjQ3MTFDMTIuNzA0IDYuODAzNjEgMTIuNzA0IDcuMDU4NzIgMTIuNTUxOSA3LjIxNTc1QzEyLjQ3OCA3LjI5MTg1IDEyLjM4MDEgNy4zMzM2NiAxMi4yNzU5IDcuMzMzNjZDMTIuMTcxNyA3LjMzMzY2IDEyLjA3MzMgNy4yOTE4NSAxMS45OTk4IDcuMjE1NzVMNi40MTYwMiAxLjQ3MDkyTDAuODMyMjE3IDcuMjE1NzVDMC43NTg3NzMgNy4yOTE4NSAwLjY2MDMyOCA3LjMzMzY2IDAuNTU2MTUyIDcuMzMzNjZaIiBmaWxsPSIjMjgyODI5Ii8+Cjwvc3ZnPgo=);\r\n}\r\n\r\n/* Buttons */\r\n\r\n.button {\r\n    border-radius: 12px;\r\n    box-shadow: none;\r\n    box-sizing: border-box;\r\n    font-size: 14px;\r\n    text-align: center;\r\n    padding: 12px 16px;\r\n    cursor: pointer;\r\n    --_label-text-weight: 400;\r\n    --_label-text-font: 'Inter', sans-serif; \r\n\r\n    &.button-bold {\r\n        font-weight: 700;\r\n    }\r\n\r\n    &.button-thick-border {\r\n        border-width: 2px;\r\n    }\r\n\r\n    & + .button {\r\n        margin-left: 12px;\r\n    }\r\n}\r\n\r\n.button-primary {\r\n    background-color: var(--wallet-primary-color);\r\n    color: #fff;\r\n    border: 0;\r\n\r\n\r\n}\r\n\r\n.button-secondary {\r\n    background-color: var(--wallet-background-color);\r\n    border: 1px solid var(--wallet-border-gray);\r\n    color: var(--wallet-primary-color);\r\n    --md-filled-button-container-color: #fff;\r\n    --_pressed-state-layer-color: #000;\r\n    --_label-text-color: var(--wallet-primary-color) !important;\r\n    --_hover-label-text-color: var(--wallet-primary-color);\r\n    transition: all 0.3s ease;\r\n\r\n    &:hover {\r\n        border-color: var(--wallet-medium-gray);\r\n        --_hover-container-elevation: 0;\r\n    }\r\n\r\n    &:active {\r\n        --_pressed-label-text-color: var(--wallet-primary-color);\r\n    }\r\n\r\n    &:focus {\r\n        --_focus-label-text-color: var(--wallet-primary-color);\r\n    }\r\n}\r\n\r\n\r\n/**\r\n * ==============================================\r\n * Dot Flashing\r\n * ==============================================\r\n */\r\n .dot-flashing {\r\n    position: relative;\r\n    width: 8px;\r\n    height: 8px;\r\n    border-radius: 5px;\r\n    background-color: var(--wallet-background-color);\r\n    color: var(--wallet-background-color);\r\n    animation: dot-flashing 1s infinite linear alternate;\r\n    animation-delay: 0.5s;\r\n    display: inline-block;\r\n    margin-left: 24px;\r\n    margin-right: 12px;\r\n  }\r\n  .dot-flashing::before, .dot-flashing::after {\r\n    content: \"\";\r\n    display: inline-block;\r\n    position: absolute;\r\n    top: 0;\r\n  }\r\n  .dot-flashing::before {\r\n    left: -12px;\r\n    width: 8px;\r\n    height: 8px;\r\n    border-radius: 5px;\r\n    background-color: var(--wallet-background-color);\r\n    color: var(--wallet-background-color);\r\n    animation: dot-flashing 1s infinite alternate;\r\n    animation-delay: 0s;\r\n  }\r\n  .dot-flashing::after {\r\n    left: 12px;\r\n    width: 8px;\r\n    height: 8px;\r\n    border-radius: 5px;\r\n    background-color: var(--wallet-background-color);\r\n    color: var(--wallet-background-color);\r\n    animation: dot-flashing 1s infinite alternate;\r\n    animation-delay: 1s;\r\n  }\r\n  \r\n  @keyframes dot-flashing {\r\n    0% {\r\n      background-color: var(--wallet-background-color);\r\n    }\r\n    50%, 100% {\r\n      background-color: rgba(255, 255, 255, 0.1);\r\n    }\r\n  }\r\n\r\n\r\n/* Grid */\r\n.wallet-row {\r\n    display: flex;\r\n    flex-wrap: wrap;\r\n    margin-left: -8px;\r\n    margin-right: -8px;\r\n\r\n    [class^=\"wallet-col-\"] {\r\n        flex-basis: 100%;\r\n        padding-left: 8px;\r\n        padding-right: 8px;\r\n    }\r\n}\r\n\r\n/* Small */\r\n@container sharedWallet (min-width: 576px) {\r\n    .wallet-row {\r\n        .wallet-col-sm-6 {\r\n            flex-basis: 50%;\r\n        }\r\n    }\r\n}\r\n\r\n/* Medium */\r\n@container sharedWallet (min-width: 768px) {\r\n    .wallet-row {\r\n        .wallet-col-md-6 {\r\n            flex-basis: 50%;\r\n        }\r\n\r\n        .wallet-col-md-4 {\r\n            flex-basis: 33.33%;\r\n        }\r\n    }\r\n}\r\n\r\n/* Large */\r\n@container sharedWallet (min-width: 992px) {\r\n    .wallet-row {\r\n        .wallet-col-lg-6 {\r\n            flex-basis: 50%;\r\n        }\r\n\r\n        .wallet-col-lg-3 {\r\n            flex-basis: 25%;\r\n        }\r\n\r\n        .wallet-col-lg-4 {\r\n            flex-basis: 33.3333%;\r\n        }\r\n    }\r\n}\r\n\r\n/* Extra Large */\r\n@container sharedWallet (min-width: 1200px) {\r\n    .wallet-row {\r\n        .wallet-col-xl-6 {\r\n            flex-basis: 50%;\r\n        }\r\n    }\r\n}\r\n\r\n.input-wrapper {\r\n  display: flex;\r\n  flex-direction: column;\r\n  margin-bottom: 0px;\r\n}\r\n\r\n.field-stack {\r\n    display: flex;\r\n    gap: 10px;\r\n    align-items: baseline;\r\n    margin-bottom: 0px;\r\n}\r\n\r\n.field-stack.dual-field .input-wrapper:first-child {\r\n  width: 25%;\r\n}\r\n \r\n.field-stack.dual-field .input-wrapper:last-child {\r\n  width: 75%;\r\n}\r\n \r\n.field-stack.single-field .input-wrapper {\r\n  width: 100%;\r\n}\r\n\r\n\r\n/* Flatpickr */\r\n.flatpickr-day.selected, \r\n.flatpickr-day.startRange, \r\n.flatpickr-day.endRange, \r\n.flatpickr-day.selected.inRange, \r\n.flatpickr-day.startRange.inRange, \r\n.flatpickr-day.endRange.inRange, \r\n.flatpickr-day.selected:focus, \r\n.flatpickr-day.startRange:focus, \r\n.flatpickr-day.endRange:focus, \r\n.flatpickr-day.selected:hover, \r\n.flatpickr-day.startRange:hover, \r\n.flatpickr-day.endRange:hover, \r\n.flatpickr-day.selected.prevMonthDay, \r\n.flatpickr-day.startRange.prevMonthDay, \r\n.flatpickr-day.endRange.prevMonthDay, \r\n.flatpickr-day.selected.nextMonthDay, \r\n.flatpickr-day.startRange.nextMonthDay, \r\n.flatpickr-day.endRange.nextMonthDay {\r\n    background-color: var(--wallet-primary-color);\r\n    border-color: var(--wallet-primary-color);\r\n}\r\n\r\n\r\n";

const WalletDropdown$1 = /*@__PURE__*/ proxyCustomElement(class WalletDropdown extends H$1 {
    constructor() {
        super();
        this.__registerHost();
        this.__attachShadow();
        this.selectOption = createEvent(this, "selectOption");
    }
    options = []; // Accept both string and array
    selectOption;
    operationsToken = ''; // Operations token for authentication
    userScopedAccessToken = ''; // User scoped access token
    selectPayment = ''; // New select-payment parameter
    displayMode = 'full'; // New display mode parameter
    paymentType = 'all'; // New payment-type parameter to filter payment options
    environment = Environment.PRODUCTION; // Environment parameter with production default
    parsedOptions = [];
    showAddNewPayment = false;
    showAddBankAccount = false;
    selectedOption = '';
    selectedPaymentMethod = '';
    selectedPaymentDate = '';
    selectedPaymentIconType = 'default';
    showPaymentSelector = true;
    showPaymentDate = false;
    walletResponse = null;
    get el() { return this; }
    oscilarCleanup = null;
    disconnectedCallback() {
        // Clean up when component is removed from the DOM
        if (this.oscilarCleanup) {
            this.oscilarCleanup();
        }
    }
    // Helper function to conditionally log only in development
    devLog = (message, ...args) => {
        if (this.environment === Environment.LOCALDEVELOPMENT || this.environment === Environment.STAGING) {
            console.log(message, ...args);
        }
    };
    async handleNewCard(paymentInstrumentToken) {
        this.showAddNewPayment = false;
        this.showPaymentSelector = true;
        await this.handleNewPaymentMethod(paymentInstrumentToken.detail, 'card');
        requestAnimationFrame(() => {
            this.expandAccordion();
        });
    }
    expandAccordion() {
        const picklistWrapper = this.el.shadowRoot?.querySelector('#picklist');
        const picklistContent = this.el.shadowRoot?.querySelector('#paymentListContainer');
        if (picklistWrapper instanceof H$1 &&
            picklistContent instanceof H$1) {
            picklistWrapper.classList.remove('collapsed');
            picklistContent.style.height = picklistContent.scrollHeight + 'px';
            // Optionally remove the 'collapsed' class from content as well if used
            picklistContent.classList.remove('collapsed');
        }
    }
    async handleNewBankAccount(paymentInstrumentToken) {
        this.showAddBankAccount = false;
        this.showPaymentSelector = true;
        await this.handleNewPaymentMethod(paymentInstrumentToken.detail, 'bank');
        requestAnimationFrame(() => {
            this.expandAccordion();
        });
    }
    updateDate(event) {
        this.devLog('listener activated: ', event);
        this.selectedPaymentDate = event.detail;
        this.collapseSection(this.el.shadowRoot.querySelector('#paymentDateContainer'));
        this.el.shadowRoot.querySelector('#paymentDate').classList.add('collapsed');
        this.devLog('State Date: ', this.selectedPaymentDate);
    }
    ;
    goToPaymentSelector(event) {
        this.devLog('goToPaymentSelector event:', event);
        this.showAddNewPayment = false;
        this.showAddBankAccount = false;
        this.showPaymentSelector = true;
    }
    ;
    handleSelectPaymentChange(newValue) {
        this.devLog('🔄 selectPayment prop changed:', {
            newValue,
            parsedOptionsLength: this.parsedOptions.length,
            currentSelectedOption: this.selectedOption
        });
        // Handle selectPayment prop changes without causing infinite loops
        if (newValue && this.parsedOptions.length > 0) {
            const matchingOption = this.parsedOptions.find(option => {
                if (typeof option === 'string') {
                    return option === newValue;
                }
                return option.value === newValue;
            });
            if (matchingOption) {
                if (matchingOption !== this.selectedOption) {
                    this.devLog('✅ Found matching option, updating selection:', matchingOption);
                    this.selectedOption = matchingOption;
                    this.selectedPaymentMethod = typeof matchingOption === 'string' ? matchingOption : matchingOption.text;
                    this.selectedPaymentIconType = typeof matchingOption === 'string' ? 'default' : matchingOption.type;
                }
                else {
                    this.devLog('ℹ️ Matching option already selected, no change needed');
                }
            }
            else {
                this.devLog('⚠️ No matching option found for selectPayment:', newValue);
            }
        }
        else if (newValue && this.parsedOptions.length === 0) {
            this.devLog('⏳ selectPayment changed but options not loaded yet, will be handled in componentWillLoad');
        }
    }
    async handleNewPaymentMethod(token, type) {
        this.devLog(`Received ${type} payment instrument token:`, token);
        // Refresh the options to include the new payment method
        await this.fetchPaymentOptions();
        this.parsedOptions = this.reorderOptionsWithNewPayment(this.parsedOptions, token);
        this.devLog('📋 Reordered options with new payment at top:', this.parsedOptions);
        // Find and select the matching option
        const matchingOption = this.parsedOptions.find(option => {
            if (typeof option === 'string') {
                return option === token;
            }
            return option.value === token;
        });
        if (matchingOption) {
            this.devLog('Found matching option:', matchingOption);
            this.selectedOption = typeof matchingOption === 'string' ? matchingOption : matchingOption;
            // Use the text property which contains the masked card number
            this.selectedPaymentMethod = typeof this.selectedOption === 'string' ? this.selectedOption : this.selectedOption.text;
            // 🔧 FIX: Update the selectedPaymentIconType for the newly added payment method
            this.selectedPaymentIconType = typeof matchingOption === 'string' ? 'default' : (matchingOption.type || 'default');
            this.devLog('🔧 Updated selectedPaymentIconType for new payment method:', this.selectedPaymentIconType);
            // Update the selectPayment property with the token value after a delay
            setTimeout(() => {
                this.selectPayment = typeof matchingOption === 'string' ? matchingOption : matchingOption.value;
            }, 0);
            // Emit the selection event
            this.selectOption.emit({
                value: typeof matchingOption === 'string' ? matchingOption : matchingOption.value,
                text: typeof matchingOption === 'string' ? matchingOption : matchingOption.text,
                type: typeof matchingOption === 'string' ? 'default' : matchingOption.type
            });
        }
        else {
            this.devLog('No matching option found for token:', token);
        }
        // Hide the appropriate form
        this.showAddNewPayment = false;
        this.showAddBankAccount = false;
        this.showPaymentSelector = true;
    }
    async initializeOscilar() {
        const oscilarIDs = await oscilarService.loadScript(this.environment);
        this.devLog('Oscilar initialized with IDs:', oscilarIDs);
    }
    async componentWillLoad() {
        this.initializeOscilar().catch(error => {
            this.devLog('Oscilar initialization failed, continuing without Oscilar:', error);
        });
        this.devLog('🚀 WalletDropdown componentWillLoad started');
        this.devLog('Component props:', {
            operationsToken: this.operationsToken ? '***PROVIDED***' : 'MISSING',
            userScopedAccessToken: this.userScopedAccessToken ? '***PROVIDED***' : 'MISSING',
            displayMode: this.displayMode,
            paymentType: this.paymentType,
            options: this.options,
            environment: this.environment
        });
        // Initialize event tracking
        initWalletEvents('WalletDropdown', this.environment);
        this.devLog('Raw options prop:', this.options);
        this.devLog('Payment type:', this.paymentType);
        // Initialize with empty array
        let options = [];
        // Parse options if passed as a string
        if (typeof this.options === 'string') {
            try {
                options = JSON.parse(this.options);
                this.devLog('Parsed options:', options);
            }
            catch (error) {
                console.error('Invalid options format. Expected a JSON string.', error);
            }
        }
        else if (Array.isArray(this.options)) {
            options = [...this.options];
            this.devLog('Options passed as array:', options);
        }
        // Fetch payment options using the dual tokens
        if (this.operationsToken && this.userScopedAccessToken) {
            try {
                this.walletResponse = await trackApiCall('/payment-options', 'GET', () => fetchPaymentOptions(this.operationsToken, this.userScopedAccessToken, this.paymentType, this.environment));
                this.devLog('API options:', this.walletResponse?.paymentOptions);
                // Map API options to the correct format
                const mappedApiOptions = this.walletResponse?.paymentOptions.map(option => typeof option === 'string'
                    ? { value: option, text: option, type: 'default' }
                    : { value: option.value, text: option.text, type: option.type });
                // Combine with existing options
                options = [...options, ...mappedApiOptions];
            }
            catch (error) {
                console.error('Error fetching payment options:', error);
            }
        }
        // Update state with all options
        this.parsedOptions = options;
        // Handle initial selectPayment prop or auto-select first option
        if (options.length > 0 && !this.selectedOption) {
            let optionToSelect = null;
            // First, check if selectPayment prop was provided and find matching option
            if (this.selectPayment) {
                optionToSelect = options.find(option => {
                    if (typeof option === 'string') {
                        return option === this.selectPayment;
                    }
                    return option.value === this.selectPayment;
                });
                if (optionToSelect) {
                    this.devLog('🎯 Found matching option for selectPayment prop:', optionToSelect);
                }
                else {
                    this.devLog('⚠️ No matching option found for selectPayment:', this.selectPayment);
                }
            }
            // If no selectPayment match found, default to first option
            if (!optionToSelect) {
                optionToSelect = options[0];
                this.devLog('📌 Auto-selecting first payment option:', optionToSelect);
            }
            // Set the selected option
            this.selectedOption = optionToSelect;
            this.selectedPaymentMethod = optionToSelect.text || optionToSelect.value;
            this.selectedPaymentIconType = optionToSelect.type || 'default';
            // Update selectPayment prop to reflect the actual selected value
            if (!this.selectPayment || this.selectPayment !== (optionToSelect.value || optionToSelect)) {
                this.selectPayment = typeof optionToSelect === 'string' ? optionToSelect : optionToSelect.value;
            }
            // Emit the selection event
            this.selectOption.emit({
                value: optionToSelect.value || optionToSelect,
                text: optionToSelect.text || optionToSelect.value || optionToSelect,
                type: optionToSelect.type || 'default'
            });
            this.devLog('✅ Selected payment option on load:', {
                selectedOption: this.selectedOption,
                selectPayment: this.selectPayment,
                selectedPaymentMethod: this.selectedPaymentMethod
            });
        }
        this.devLog('✅ componentWillLoad completed. Final state:', {
            parsedOptionsLength: this.parsedOptions.length,
            selectedOption: this.selectedOption,
            showPaymentSelector: this.showPaymentSelector,
            showAddNewPayment: this.showAddNewPayment
        });
    }
    getPaymentIconClass = (paymentType) => {
        const paymentTypeClasses = {
            'BankAccount': 'icon-echeck',
            'BankAccount-checking': 'icon-echeck',
            'BankAccount-savings': 'icon-echeck',
            'Card-visa': 'icon-visa',
            'Card-mastercard': 'icon-mastercard',
            'Card-americanexpress': 'icon-amex',
            'Card-discover': 'icon-discover',
            'Card-jcb': 'icon-jcb',
            'Card-upi': 'icon-upi',
            'default': '' // No icon if no match found
        };
        this.devLog(`🎯 Icon mapping debug: paymentType='${paymentType}' (type: ${typeof paymentType})`);
        this.devLog('🎯 Available mapping keys:', Object.keys(paymentTypeClasses));
        const iconClass = paymentTypeClasses[paymentType] || paymentTypeClasses['default'];
        this.devLog(`🎯 Mapped to iconClass: '${iconClass}'`);
        // Additional debugging for Mastercard specifically
        if (paymentType && paymentType.toLowerCase().includes('master')) {
            this.devLog('🔍 Mastercard detected in paymentType:', paymentType);
            this.devLog('🔍 Exact match check for "Card-mastercard":', paymentTypeClasses['Card-mastercard']);
            this.devLog('🔍 paymentType === "Card-mastercard":', paymentType === 'Card-mastercard');
        }
        // Debug for any undefined/null paymentType
        if (!paymentType || paymentType === 'undefined' || paymentType === 'null') {
            this.devLog('⚠️ WARNING: paymentType is undefined/null/string-null:', paymentType);
        }
        return iconClass;
    };
    goToNewPayment = () => {
        trackAddPaymentStarted();
        this.showAddNewPayment = true;
        this.showPaymentSelector = false;
    };
    goToNewBankAccount = () => {
        trackAddBankStarted();
        this.showAddBankAccount = true;
        this.showPaymentSelector = false;
    };
    handleSelect(option) {
        this.selectedOption = typeof option === 'string'
            ? { value: option, text: option, type: 'default' }
            : option;
        this.selectedPaymentMethod = this.selectedOption.text;
        // Update selectPayment after a brief delay to avoid render cycle issues
        setTimeout(() => {
            this.selectPayment = typeof option === 'string' ? option : option.value;
        }, 0);
        // Track payment method selection
        trackPaymentSelection(this.selectedOption.value || this.selectedOption.text, this.selectedOption.type || 'default', this.selectedOption.text);
        this.selectOption.emit(this.selectedOption);
        this.collapseSection(this.el.shadowRoot.querySelector('#paymentListContainer'));
        // Debug the icon type assignment
        this.devLog('🔧 Setting selectedPaymentIconType from selectedOption.type:', this.selectedOption.type);
        this.devLog('🔧 Full selectedOption object:', this.selectedOption);
        this.selectedPaymentIconType = this.selectedOption.type || 'default';
        this.devLog('🔧 Final selectedPaymentIconType set to:', this.selectedPaymentIconType);
        this.el.shadowRoot.querySelector('#picklist').classList.add('collapsed');
    }
    mapPaymentOptions(paymentOptions) {
        return paymentOptions.map((option) => typeof option === 'string'
            ? { value: option, text: option, type: 'default' }
            : { value: option.value, text: option.text, type: option.type });
    }
    reorderOptionsWithNewPayment(options, newPaymentToken) {
        // Move the newly added payment method to the top if token provided
        if (!newPaymentToken) {
            return options;
        }
        return [
            ...options.filter(option => option.value === newPaymentToken),
            ...options.filter(option => option.value !== newPaymentToken)
        ];
    }
    findNewlyAddedOption(options, newPaymentToken) {
        // If we have a new payment token, try to find and select that payment method
        if (!newPaymentToken) {
            return null;
        }
        const newlyAddedOption = options.find(option => (typeof option === 'string' ? option : option.value) === newPaymentToken);
        if (newlyAddedOption) {
            this.devLog('🎯 Found and selecting newly added payment method:', newlyAddedOption);
        }
        else {
            this.devLog('⚠️ Could not find newly added payment method with token:', newPaymentToken);
        }
        return newlyAddedOption;
    }
    updateSelectedOption(selectedOption) {
        this.selectedOption = selectedOption;
        this.selectedPaymentMethod = typeof selectedOption === 'string' ? selectedOption : selectedOption.text;
        // Update selectPayment after a delay to avoid render cycle issues
        setTimeout(() => {
            this.selectPayment = typeof selectedOption === 'string' ? selectedOption : selectedOption.value;
        }, 0);
        // Set the payment icon type for the selected option
        this.selectedPaymentIconType = typeof selectedOption === 'string' ? 'default' : (selectedOption.type || 'default');
    }
    trackAndEmitSelection(selectedOption) {
        // Track selection of payment method after refresh
        this.devLog('🔄 Selecting payment method after refresh, tracking event...');
        trackPaymentSelection(typeof selectedOption === 'string' ? selectedOption : selectedOption.value, typeof selectedOption === 'string' ? 'default' : (selectedOption.type || 'default'), typeof selectedOption === 'string' ? selectedOption : selectedOption.text);
        this.devLog('✅ Selection event tracked');
        this.selectOption.emit({
            value: typeof selectedOption === 'string' ? selectedOption : selectedOption.value,
            text: typeof selectedOption === 'string' ? selectedOption : selectedOption.text,
            type: typeof selectedOption === 'string' ? 'default' : (selectedOption.type || 'default')
        });
        this.devLog('Selected payment option after refresh:', selectedOption);
    }
    async refreshDropdown(type = 'card', newPaymentToken) {
        this.devLog(`Refreshing dropdown after ${type} addition`, newPaymentToken ? `with new token: ${newPaymentToken}` : '');
        this.showAddNewPayment = false;
        this.showAddBankAccount = false;
        if (!(this.operationsToken && this.userScopedAccessToken)) {
            return;
        }
        this.walletResponse = await trackApiCall('/payment-options-refresh', 'GET', () => fetchPaymentOptions(this.operationsToken, this.userScopedAccessToken, this.paymentType, this.environment));
        this.devLog('Updated payment options:', this.walletResponse?.paymentOptions);
        const paymentOptions = this.walletResponse?.paymentOptions || [];
        let options = this.mapPaymentOptions(paymentOptions);
        // Move the newly added payment method to the top if token provided
        options = this.reorderOptionsWithNewPayment(options, newPaymentToken);
        this.parsedOptions = options;
        // Select the newly added payment method if token provided, otherwise select first option
        if (this.parsedOptions.length === 0) {
            return;
        }
        const newlyAddedOption = this.findNewlyAddedOption(this.parsedOptions, newPaymentToken);
        // Default to first option
        const selectedOption = newlyAddedOption || this.parsedOptions[0];
        this.updateSelectedOption(selectedOption);
        this.trackAndEmitSelection(selectedOption);
    }
    async fetchPaymentOptions() {
        try {
            if (this.operationsToken && this.userScopedAccessToken) {
                this.walletResponse = await fetchPaymentOptions(this.operationsToken, this.userScopedAccessToken, this.paymentType, this.environment);
                this.devLog('Updated payment options:', this.walletResponse?.paymentOptions);
                // Map all options to ensure consistent format
                const parsedOptions = this.walletResponse?.paymentOptions.map(option => typeof option === 'string'
                    ? { value: option, text: option, type: 'default' }
                    : { value: option.value, text: option.text, type: option.type });
                // Update the parsed options
                this.parsedOptions = parsedOptions;
                // If there are payment options, select the first one by default
                if (parsedOptions.length > 0) {
                    const firstOption = parsedOptions[0];
                    this.selectedOption = firstOption;
                    // Use the text property which contains the masked card number
                    this.selectedPaymentMethod = firstOption.text;
                    // Don't modify selectPayment here to avoid render cycle issues
                    // Set the payment icon type for the selected option
                    this.selectedPaymentIconType = firstOption.type || 'default';
                    // Emit the selection event
                    this.selectOption.emit({
                        value: firstOption.value,
                        text: firstOption.text,
                        type: firstOption.type
                    });
                    this.devLog('Auto-selected first payment option:', firstOption);
                }
            }
        }
        catch (error) {
            console.error('Error fetching payment options:', error);
        }
    }
    collapseSection(element) {
        this.devLog('Collapsing Section');
        const sectionHeight = element.scrollHeight;
        const elementTransition = element.style.transition;
        element.style.transition = '';
        requestAnimationFrame(() => {
            element.style.height = sectionHeight + 'px';
            element.style.transition = elementTransition;
            requestAnimationFrame(() => {
                element.style.height = 0 + 'px';
                element.classList.add('collapsed');
            });
        });
    }
    toggleCollapse(event) {
        const collapseButton = event.currentTarget;
        const collapseWrapper = this.el.shadowRoot.querySelector(`#${collapseButton.dataset.collapsewrapper}`);
        const element = collapseWrapper.querySelector('.collapsible-content');
        // const element = this.el.shadowRoot.querySelector('.collapsible-content') as HTMLElement;
        const collapsed = collapseWrapper.classList.contains('collapsed');
        if (element) {
            if (collapsed) {
                this.expandSection(element);
                collapseWrapper.classList.remove('collapsed');
            }
            else {
                collapseWrapper.classList.add('collapsed');
                this.collapseSection(element);
            }
        }
    }
    expandSection(element) {
        const sectionHeight = element.scrollHeight;
        element.style.height = sectionHeight + 'px';
    }
    isCheckingWithLongNumber(option) {
        const text = typeof option === 'string' ? option : option.text ?? '';
        if (text.toLowerCase().startsWith('checking:')) {
            // Extract everything after "checking:"
            const accountPart = text.replace(/^checking:\s*/, '');
            return accountPart.length > 15;
        }
        return false;
    }
    render() {
        this.devLog('🎨 WalletDropdown render() called');
        this.devLog('Render state:', {
            displayMode: this.displayMode,
            showPaymentSelector: this.showPaymentSelector,
            showAddNewPayment: this.showAddNewPayment,
            showAddBankAccount: this.showAddBankAccount,
            parsedOptionsLength: this.parsedOptions.length,
            selectedOption: this.selectedOption
        });
        // Text-only mode - render just the selected payment method text
        if (this.displayMode === 'text-only') {
            // Default text when no option is selected
            if (!this.selectedOption) {
                return h$2("div", { class: "wallet-text-only wallet-text-only--empty" }, "Default payment: Not selected");
            }
            // Get the display text from the selected option and format it
            const displayText = typeof this.selectedOption === 'string'
                ? `Default payment: ${this.selectedOption}`
                : `Default payment: ${this.selectedOption.text}`;
            return (h$2("div", { class: "wallet-text-only" }, displayText));
        }
        // Full mode - render the complete dropdown
        return (h$2("div", { class: "shared-wallet" }, this.showPaymentSelector && (h$2("div", { class: "payment-selector", style: {
                maxWidth: this.isCheckingWithLongNumber(this.selectedOption) ? '430px' : '400px',
            } }, h$2("div", { class: "collapsible-wrapper accordion-item collapsed", id: "picklist" }, h$2("div", { class: "collapsible-header", "data-collapsewrapper": "picklist", onClick: (event) => this.toggleCollapse(event), "aria-expanded": "false", "aria-controls": "paymentList" }, h$2("h3", { class: "panel-header text-medium-strong" }, "Choose a Payment Method to Add")), h$2("div", { class: "collapsible-content", id: "paymentListContainer", style: { height: '0' } }, h$2("md-filled-button", { class: "button button-secondary button-bold button-thick-border w-100", onClick: this.goToNewPayment }, "Add New Card Account"), this.paymentType !== 'card' && (h$2("md-filled-button", { class: "button button-secondary button-bold button-thick-border w-100", onClick: this.goToNewBankAccount }, "Add New Bank Account")))))), this.showAddNewPayment && (h$2("div", { class: "add-payment-container" }, h$2("add-new-payment", { operationsToken: this.operationsToken, userScopedAccessToken: this.userScopedAccessToken, environment: this.environment, availableCreditCards: this.walletResponse?.availableCreditCards, onCardAdded: (event) => this.refreshDropdown('card', event.detail) }))), this.showAddBankAccount && (h$2("div", { class: "add-payment-container" }, h$2("add-bank-account", { operationsToken: this.operationsToken, userScopedAccessToken: this.userScopedAccessToken, environment: this.environment, onBankAccountAdded: (event) => this.refreshDropdown('bank', event.detail) })))));
    }
    static get watchers() { return {
        "selectPayment": ["handleSelectPaymentChange"]
    }; }
    static get style() { return walletdropdownModuleCss; }
}, [1, "wallet-dropdown", {
        "options": [1],
        "operationsToken": [1, "operations-token"],
        "userScopedAccessToken": [1, "user-scoped-access-token"],
        "selectPayment": [1537, "select-payment"],
        "displayMode": [1, "display-mode"],
        "paymentType": [1, "payment-type"],
        "environment": [1],
        "parsedOptions": [32],
        "showAddNewPayment": [32],
        "showAddBankAccount": [32],
        "selectedOption": [32],
        "selectedPaymentMethod": [32],
        "selectedPaymentDate": [32],
        "selectedPaymentIconType": [32],
        "showPaymentSelector": [32],
        "showPaymentDate": [32],
        "walletResponse": [32]
    }, [[0, "cardAdded", "handleNewCard"], [0, "bankAccountAdded", "handleNewBankAccount"], [16, "updateDate", "updateDate"], [16, "goToPaymentSelector", "goToPaymentSelector"]], {
        "selectPayment": ["handleSelectPaymentChange"]
    }]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["wallet-dropdown", "add-bank-account", "add-new-payment", "date-picker", "mfa-model-popup"];
    components.forEach(tagName => { switch (tagName) {
        case "wallet-dropdown":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, WalletDropdown$1);
            }
            break;
        case "add-bank-account":
            if (!customElements.get(tagName)) {
                defineCustomElement$5();
            }
            break;
        case "add-new-payment":
            if (!customElements.get(tagName)) {
                defineCustomElement$4();
            }
            break;
        case "date-picker":
            if (!customElements.get(tagName)) {
                defineCustomElement$3();
            }
            break;
        case "mfa-model-popup":
            if (!customElements.get(tagName)) {
                defineCustomElement$2();
            }
            break;
    } });
}
defineCustomElement$1();

const WalletDropdown = WalletDropdown$1;
const defineCustomElement = defineCustomElement$1;

export { WalletDropdown, defineCustomElement };
//# sourceMappingURL=wallet-dropdown.js.map

//# sourceMappingURL=wallet-dropdown.js.map
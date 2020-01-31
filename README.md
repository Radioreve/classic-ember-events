# Ember Events Inside Out

Ember has notoriously been hard to learn. Surely, its thin documentation, often incomplete and sometimes not up to date has not helped the framework to reach widespread usage. 

Ember Octane changes a lot of things. In a way, it feels like Ember 3.x series were just experimentations in order for the core team to harvest feedback from the community  as to which APIs were good and which ones needed to be reworked.

However, migrating to Octane from a large codebase can be challenging. In the meantime, a lot of Ember developers may be stuck with what is called Classic Ember. One of the most confusing aspects of the framework is the plethora of possibilities when it comes to handling DOM events. 

This repository helps to clarify all the different possibilities and how they interact with each other. Much credits to this very in-depth article, that helped me clarify all of this : 
https://developer.squareup.com/blog/deep-dive-on-ember-events/



### Repository structure

This repository contains a very simple structure with :

- A single route along with its associated : `hello.js`
- A component `<ActionHandler>`
- The component is made of a wrapping `<div>`s around a simple `<button>`
- Another component wrapping the former, `<ActionHandlerWrapper>`
- The route merely instanciates the component.
- The route's controller

### Enumeration of all event handling possibilities

There are currently no less but _four different ways_ to handle `DOM` events, which can interact in subtle ways. 

- Using an action `modifier` ---> `<div {{action "hello"}}></div>`
- Using an action `helper` ---> `<div onclick={{action "hello"}}></div>` This form is also known as a `closure action`and is present in Ember since `1.x`to replace the deprecated `sendAction`
- Passing an action property on the component ---> `<MyComponent click={{action "hello"}}>`
- Defining a `click(){ ... }`method directly on the component's class. This iq equivalent to passing an action property, because the two cannot coexist: they share the same property. The only different is : is the handler defined inside the callee's class (this case) or inside the caller's class (third case).

### Demonstration strategy 
Each if the possibilities above have been setup in a strategic way to demonstrate what is explained in the squareup article. In short, here is what happens:

- Each time a click (or anyother event for that matter) is triggered by the DOM, it bubbles up from where it originates to the root element. On the way, any `action helper`will be triggered, receiving the real `DOMEvent` object from the DOM. Calling `e.stopPropagation()` on this event will cause no further calls whatsoever. As per the DOM's normal behavior, any other `action helper` on the way up will be triggered to.
- Once it reaches the top, Ember detects it and takes over. Basically, it does the exact same thing again but this time, triggering `action modifiers` without passing them any event ! However, this is a little bit trickier.
- It will first trigger any modifier defined in any attributes inside the component's template. When it reaches the top, it will look for an action defined as a property, and execute the corresponding controller's action. When, it will apply the same operation on any wrapping parent until it reaches the top level component.


### Why it matters 
Understanding this is important when debbugging complex cases. But how to know which is the best form to use ? Well, thare a few key things to consider in order not to _prendre ses pieds dans le tapis_.

- `action helpers` === `closure actions` If you need to have access to the `DOM Event`, it means that you're committing yourself to do something deliberately `DOM-oriented` and not really `Ember-component oriented` , something imperative over declarative. Sometime, it is necessary. However, most of the time, the right approach is to use ...
- ... `action modifiers`. Action modifiers don't get the messy imperative `DOMElement` object as their first argument. Why ? Because they don't need it ! These actions are designed to stay in the pure Ember part of  your application, and therefore are designed only for pure `Component to Component`communication. How does a parent and a child component communicate date ? By using the unidirectionnal dataflow model enforced in Ember with the `Data Down Action Up`pattern. Here is how it works 

### DDAU
DDAU works by involving 2 components : the `parent` and the `child`, the `caller` and the `callee`.

- The `children` is agnostic of how it will be used. All it knows is that when the user clicks on it, it will trigger something. This is done like this : 


````
// child.hbs
<div>
	<button {{action "gotClicked"}}>Click me, i'm the dumb child</button>
</div>

// child.js
actions: {
	gotClicked() {
        // And then what ? What Am I supposed to do ? lol 
    }
}
````

Now a parent comes along and wants to use this child. It will only have to instanciate it in its template: 
````
// parent.hbs
<Child>
	// Cool, I have a child that responds to click but does nothing...
    // How can I execute my beOverProtective() action when someone clicks on my child ?
</Child>

// parent.js
actions: {
    beOverProtective() {
        alert('GET THE F* AWAY')
    }
}
````
Now, the child will alter its behavior to execute a method call whenImClick() (not an action) that will be provided by the parent. This is the "Actions Up" part of the pattern, because the action is provided by the parent who is higher in the component tree : 
````
// child.js
whenImClick: null,  // this is to be explicit that the property must come from elsewhere
actions: {
    actions: {
	gotClicked() {
        whenImClicked(); // Cool, I can now notify my caller that i've been clicked
                         // and let his implementation take over from here
    }
}

// parent.hbs
<Child whenImClicked={{action "beOverProtective"}} >
    // Here we are binding the whenImClicked property with our own beOverProtective action
</Child>
````
This is the essence of DDAU. An implementation of inversion of control, because the ultimate caller, the children, does not also control the implementation being called.

### Misc.
- What happens if we forget to use the quote ? Well, if we do, Ember won't be looking for the method on the action hash, but instead, will look for it directly on the component which is subjet to naming collision with other properties. This is why the action hash exist in the first place. Another important reason for the action hash to exist is to access 'this' inside its methods. Without it, Ember won't bind the component's context. 
- What if I want to pass down an action between Grandfather to children directly ? Then, grandfather will set a property on the parent, and the parent will  bind not his own action but the property it received directly. This is an application of the usecase where you don't want to put double quotes around your action modifier.


### What about Octane ? 
Octane simplifies and unifies a lot of the concepts above. But understanding where Ember comes from will surely helps to get a deeper understanding of Octane. To learn more about it, feel free to explore the documentation here : https://guides.emberjs.com/release/upgrading/current-edition/action-on-and-fn/

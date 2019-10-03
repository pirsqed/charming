

function make_charm_selector(charms){
	//creating the interface for selecting charms and adding cards.
	var ability_list = document.getElementById('ability_select');
	ability_list.size = 1;
	ability_list.onchange = function(){
		show_charms(charms);
	};
	var ability_option = document.createElement('option');
	ability_option.value = 'All';
	ability_option.text = 'All';
	ability_option.classList.add('ability_select');

	ability_list.appendChild(ability_option);
	Object.keys(charms).forEach(key => {
		var ability_option = document.createElement('option');
		ability_option.value = key;
		ability_option.text = key;
		ability_option.classList.add('ability_select');

		ability_list.appendChild(ability_option);
	});

	return null;
}

function show_charms(all_charms){
	select = document.getElementById('ability_select');
	ability = select.options[select.selectedIndex].value;
	var charm_list = {};
	if (ability == 'All'){
		// all_charms is formatted like this:
		// all_charms = {
		// 	Archery: {archery_charms},
		// 	Athletics: {athletics_charms},
		// };
		// We wanna look at all the charms, we want to merge all of those
		// ability objects into one big object with all the charms.
		// I can't think of any way to one-line this, so forEach it is.
		Object.keys(all_charms).forEach(key => {
				charm_list = {...charm_list, ...all_charms[key]};
			});
		charm_list = Object.values(charm_list);
		charm_list.sort(sort_array_by_name);
	}else{
		charm_list = Object.values(all_charms[ability]);
		charm_list.sort(sort_array_by_requirements);
	}




	charm_filter = get_charm_filter_from_input();
	console.log(charm_filter);
	cl = document.getElementById('charm_list');

	charm_count = 0;
	excluded_count = 0;
	cl.innerHTML = '';
	charm_list.forEach(cd => {
		// cd == charm data

		if (exclude_charm(cd, charm_filter)){
			excluded_count += 1;
			return;
		}
		charm_count += 1;

		charm_name = cd['name'];

		var charm = document.createElement('div');
		charm.classList.add('short_charm');
		charm.onclick = function(){
			showPreview(cd);
		};

		var name = document.createElement('div');
		name.style = 'font-weight: bold;';
		name_text = document.createTextNode(charm_name);
		name.appendChild(name_text);

		var req_notes = document.createElement('div');
		rn = `${cd['ability_req']}, ${cd['essence_req']}; <b>Cost: </b>${cd['cost']} <b>Type: </b>${cd['type']}
		<br>
		<b>Keywords: </b>${cd['keywords']}; <b>Duration: </b>${cd['duration']}
		<br>
		<b>Pre-Reqs:</b> ${cd['pre_reqs']}`;
		req_notes.innerHTML = rn;

		charm.appendChild(name);
		charm.appendChild(req_notes);
		cl.appendChild(charm);
	});
	cl.scrollTo(0,0);

	charm_count_div = document.querySelector('.charm_count');
	charm_count_div.innerHTML = `${charm_count} charms found`;

	console.log(`${excluded_count} excluded`);

}

function get_charm_filter_from_input(){
	let filters = document.querySelectorAll('.filter');
	var filter_obj = {};

	filters.forEach(input => {
		if (input.value == ''){
			return;
		}
		if (input.type == 'checkbox' && input.checked == false){
			return;
		}



		// we'll do an 'or' search on text inputs, so we'll break those up with spaces.
		// TODO: Maybe strip punctuation?
		split_values = input.value.split(' ');

		if (!(input.name in filter_obj)){
			filter_obj[input.name] = [];
		}

		filter_obj[input.name] = filter_obj[input.name].concat(split_values);
	});
	return filter_obj;
}

function exclude_charm(charm_data, filter){
	var exclude = false;
	Object.keys(filter).forEach(key => {
		if (exclude){
			return;
		}
		if (key == 'search'){
			charm_string = Object.values(charm_data).toString().toUpperCase();
			filter[key].forEach(search_string => {
				search_string = search_string.toUpperCase()
				if (charm_string.includes(search_string) == false){
					// console.log(`Did not find ${search_string} in ${charm_string}`)
					exclude = true;
					// since we're in a funciton,
					// we have to use return, instead of continue.
					return;
				}
			});
		}else if (key == 'name' || key == 'description'){
			filter[key].forEach(search_string => {
				upper_string = charm_data[key].toUpperCase();
				search_string = search_string.toUpperCase()
				if (upper_string.includes(search_string) == false){
					console.log(`Did not find ${search_string} in ${charm_data[key]}`)
					exclude = true;
					// since we're in a funciton,
					// we have to use return, instead of continue.
					return;
				}
			});
		}else{
			//get just the req number.
			let req_num = charm_data[key].split(' ')[1];
			//our essence and ability req filters are arrays of allowed numbers.
			//if the charm requirement is in that filter array, then we're good.
			if (filter[key].includes(req_num) == false){
				exclude = true;
				return;
			}
		}
	});

	return exclude;
}

function sort_array_by_requirements(a, b){
	// we get the second item here, which will be the numerical
	// requirement of the main ability. There are (at least) two charms that
	// have more than one ability requirement.
	// The first is the primary ability, though.
	let a_req = parseInt(a['ability_req'].split(' ')[1]);
	let b_req = parseInt(b['ability_req'].split(' ')[1]);

	if (a_req == b_req){
		// the ability requirements are the same
		// so now we sort by essense requirments
		let a_ess = parseInt(a['essence_req'].split(' ')[1]);
		let b_ess = parseInt(b['essence_req'].split(' ')[1]);

		// finally, if the ability and essence requirements are the same
		// then we'll sort by name.
		if (a_ess == b_ess){
			return sort_array_by_name(a, b);
		}

		return a_ess - b_ess;
	}

	return a_req - b_req;
}

function sort_array_by_name(a, b){

	a_name = a['name'];
	b_name = b['name'];
	return a_name.localeCompare(b_name);

}


function make_blank_card_data(){
	card_data = {
		name: 'Charm Name',
		ability: '',
		ability_req: 'Ability',
		essence_req: 'Essence',
		cost: '',
		type: '',
		keywords: '',
		duration: '',
		pre_reqs: '',
		description: '',
		page: '',
	}
	return card_data;
}

function showPreview(charm_data){
	cp = document.getElementById('card_preview');
	cp.innerHTML = '';
	card = document.createElement('div');

	var name = makeInputForPreview('name', charm_data['name'], ['preview', 'name']);
	card.appendChild(name);


	var ability_req = makeInputForPreview(
		'ability_req', charm_data['ability_req'], ['preview', 'ability_req']);
	var essence_req = makeInputForPreview(
		'essence_req', charm_data['essence_req'], ['preview', 'essence_req']);

	var req_div = document.createElement('div');
	req_div.appendChild(ability_req);
	req_div.appendChild(essence_req);
	card.appendChild(req_div);

	var cost = makeInputForPreview('cost', charm_data['cost'], ['preview', 'cost'], 'Cost:');
	var_div = document.createElement('div');
	var_div.appendChild(cost);
	card.appendChild(var_div);

	var type = makeInputForPreview('type', charm_data['type'], ['preview', 'type'], 'Type:');
	var_div = document.createElement('div');
	var_div.appendChild(type);
	card.appendChild(var_div);

	var keywords = makeInputForPreview('keywords', charm_data['keywords'], ['preview', 'keywords'], 'Keywords:');
	var_div = document.createElement('div');
	var_div.appendChild(keywords);
	card.appendChild(var_div);

	var duration = makeInputForPreview('duration', charm_data['duration'], ['preview', 'duration'], 'Duration:');
	var_div = document.createElement('div');
	var_div.appendChild(duration);
	card.appendChild(var_div);

	var pre_reqs = makeInputForPreview('pre_reqs', charm_data['pre_reqs'], ['preview', 'pre_reqs'], 'Pre-Req Charms:');
	var_div = document.createElement('div');
	var_div.appendChild(pre_reqs);
	card.appendChild(var_div);

	// need a textarea for description.
	var desc = document.createElement('textarea');
	desc.id = 'description';
	desc.classList.add('preview');
	desc.classList.add('description');
	desc.rows = 9;
	desc.style = 'width: 95%;';
	desc_text = document.createTextNode(charm_data['description']);
	desc.appendChild(desc_text);
	var lbl = document.createElement('label');
	label_text = document.createTextNode('Description:');
	lbl.appendChild(label_text);
	var br = document.createElement('br');
	lbl.appendChild(br);
	lbl.appendChild(desc);
	var_div = document.createElement('div');
	var_div.appendChild(lbl);
	card.appendChild(var_div);

	var page = makeInputForPreview('page', charm_data['page'], ['preview', 'page'], 'Page:');
	var_div = document.createElement('span');
	var_div.appendChild(page);
	card.appendChild(var_div);


	var button = document.createElement('button');
	button.style = 'position: absolute; right 0; margin: 0 2em 0 0; z-index: 2'
	button.onclick = function(){
		addCardFromPreview();
	}
	button.innerHTML = 'Add Card';
	card.appendChild(button);


	cp.appendChild(card);
}

function addCardFromPreview(){
	card_inputs = document.querySelectorAll('.preview');

	card = {};
	card_inputs.forEach(function(input) {
    	key = input.id;
		card[key] = input.value;
  	});

	card.ability = card.ability_req.split(' ')[0];

	addCard(card);
}

function makeInputForPreview(name, text, class_array, label=''){
	var input = document.createElement('input');
	input.value = text;
	input.id = name;
	class_array.forEach(css_class => {
		input.classList.add(css_class);
	});


	if (label != ''){
		var lbl = document.createElement('label');
		label_text = document.createTextNode(label);
		lbl.appendChild(label_text);
		lbl.appendChild(input);
		return lbl;
	}

	return input;
}

function addCard(card_data={}){
	if (!card_data){
		card_data = make_blank_card_data();
	}
	var ch = document.getElementById('card_holder');

	var card = document.createElement('div');
	card.classList.add('card');

	// if (card_data.ability != ''){
	// 	var icon = document.createElement('div');
	// 	icon.classList.add('charm_icon');
	// 	icon.classList.add(card_data.ability);
	// 	card.appendChild(icon);
	// }

	var name = document.createElement('div');
	name.classList.add('name');
	name_text = document.createTextNode(card_data.name);
	name.appendChild(name_text);
	card.appendChild(name);

	var requirements = document.createElement('div');
	requirements.classList.add('requirements');
	var reqs = card_data.ability_req + ', ' + card_data.essence_req;
	var reqs_text = document.createTextNode(reqs);
	requirements.appendChild(reqs_text);
	card.appendChild(requirements);

	// Cost used to be in notes, but since I moved it to the right corner,
	// cost now gets its own special div.
	var cost_holder = document.createElement('div');
	cost_holder.classList.add('cost_holder');
	var cost_label = document.createElement('div');
	cost_label.classList.add('cost_label');
	var cost_label_text = document.createTextNode('Cost');
	cost_label.appendChild(cost_label_text);
	cost_holder.appendChild(cost_label);
	var cost = document.createElement('div');
	cost_label.classList.add('cost');
	cost_text = document.createTextNode(card_data.cost);
	cost.appendChild(cost_text);
	cost_holder.appendChild(cost);
	card.appendChild(cost_holder);


	var notes = document.createElement('div');
	notes.classList.add('notes');
	var note_classes = ['type', 'keywords', 'duration', 'pre_reqs'];
	var note_prefixes = ['Type: ', 'Keywords: ', 'Duration: ', 'Charm Pre-Reqs: '];
	for (i = 0; i < note_classes.length; i++){
		var div = document.createElement('div');
		div.classList.add(note_classes[i]);
		var text = document.createTextNode(note_prefixes[i] + card_data[note_classes[i]]);
		div.appendChild(text);
		notes.appendChild(div);
	}
	card.appendChild(notes);

	var description = document.createElement('div');
	description.classList.add('description');
	var desc_text = document.createTextNode(card_data.description);
	description.appendChild(desc_text);
	card.appendChild(description);

	var page = document.createElement('div');
	page.classList.add('page');
	var page_text = document.createTextNode(card_data.page);
	page.appendChild(page_text);
	card.appendChild(page);

	var delete_button = document.createElement('button');
	delete_button.classList.add('delete');
	delete_button.classList.add('no-print');
	delete_button.onclick = function(){
		card_div = this.parentNode;
		ch.removeChild(card_div);
	}
	delete_button.innerHTML = 'X';
	card.appendChild(delete_button);

	ch.append(card);

	return null
}

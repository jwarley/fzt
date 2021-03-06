function find_subseq(query, target) {
    let subseq_result = find_subseq_accum(query, target, [], 0);

    // Compute the longest match length if any
    if (subseq_result.found) {
        subseq_result.max_run_len = find_max_run(subseq_result.matches);
    }

    return subseq_result
}

function find_subseq_accum(query, target, match_idxs, cur_idx) {
    if (query.length === 0) {
        return {
            "found": true,
            "matches": match_idxs,
        };
    } else if (target.length === 0) {
        return {
            "found": false,
        };
    }

    if (query[0] === target[0]) {
        return find_subseq_accum(query.slice(1), target.slice(1), match_idxs.concat([cur_idx]), cur_idx + 1);
    } else {
        return find_subseq_accum(query, target.slice(1), match_idxs, cur_idx + 1);
    }
}

// Compute the length of the longest consecutive subsequence in a sorted list of ints
function find_max_run(xs) {
    if (xs.length === 0) { return 0; }

    let cur_run_len = 1;
    let best_seen = 0;
    for (let i = 1; i < xs.length; i++) {
        if (xs[i - 1] === xs[i] - 1) {
            // If the current two indices are consecutive terms, the run just got longer by 1.
            cur_run_len += 1;
        } else {
            // Otherwise, the run is over.
            best_seen = Math.max(cur_run_len, best_seen);
            cur_run_len = 1;
        }
    };

    // We still need to do a max check in case the whole sequence was a run.
    return Math.max(best_seen, cur_run_len);
}

// TODO: Improve scoring algorithm?
// TODO: If not, at least optimize away the extra two find calls.
function subseq_filter(query, corpus, field) {
    return corpus.filter((target) => {
        return find_subseq(query, target[field].toLowerCase()).found;
    }).sort((t1, t2) => {
        const r1 = find_subseq(query, t1[field].toLowerCase());
        const r2 = find_subseq(query, t2[field].toLowerCase());
        return r2.max_run_len - r1.max_run_len;
    });
}

// Returns a DOM object representing the text of `str` with indices `idxs` highlighted
function to_highlighted(str, idxs) {
    let result_str = "";
    let next_idx = 0;
    for (let i = 0; i < str.length; i++) {
        if (next_idx >= idxs.length || i !== idxs[next_idx]) {
            result_str += str[i];
        } else {
            result_str += "<span class='highlight'>" + str[i] + "</span>";
            next_idx += 1
        }
    };

    let el = document.createElement("p");
    el.innerHTML = result_str;
    return el;
}

function populate_title_list(tabs) {
    let tab_ul = document.getElementById("tab_list");
    tab_ul.innerHTML = "";

    const search_str = document.getElementById("main_text_field").value;
    let results = subseq_filter(search_str, tabs, "title");

    for (let i = 0; i < results.length; i++) {
        const tab_desc = results[i].title;

        // TODO: optimize out this find_subseq call
        const highlighted_desc = to_highlighted(tab_desc, find_subseq(search_str, tab_desc.toLowerCase()).matches);

        // create a DOM element for the ith search result
        let li = document.createElement("li");
        li.appendChild(highlighted_desc);
        li.id = "search_result_" + i.toString();

        // shade the first result
        if (i === 0) {
            li.classList.add("will_open");
        }

        tab_ul.appendChild(li);
    };

    return results;
}

function select_tab(tab_id) {
    browser.tabs.update(tab_id, {active: true});
    window.close();
}

function init() {
    let tab_list = undefined;
    browser.tabs.query({currentWindow: true}, (tabs) => {
        tab_list = populate_title_list(tabs);
        document.getElementById("main_text_field").oninput = () => {
            tab_list = populate_title_list(tabs);
        }
    });

    let selected_result = 0;
    document.addEventListener("keyup", (ev) => {
        if (ev.key === "Tab") { // (Not that kind of Tab)
            console.log(selected_result);
            // unshade the previously selected search result and shade the newly selected result
            document.getElementById("search_result_" + selected_result.toString()).classList.remove("will_open");
            selected_result = (selected_result + 1) % tab_list.length;
            document.getElementById("search_result_" + selected_result.toString()).classList.add("will_open");
        } else if (ev.key === "Enter") {
            select_tab(tab_list[selected_result].id);
        }
    });

    document.getElementById("tab_select_form").onsubmit = () => select_tab(tab_list[selected_result].id);
}

window.onload = init;

/* widjet.js
 * ---------
 * Tender Blacklist widget.
 *
 * Author: Code for Africa
 * URL: https://codeforafrica.org/
 * License: MIT
 */

var TenderBlacklist = {
  fn: {}
};

$(function() {
  TenderBlacklist.fn.load_data();

  $('.widget input').keypress(function(e) {
    if (e.which == 13) {
      TenderBlacklist.fn.search();
    }
  });

  $('.widget button').click(function() {
    TenderBlacklist.fn.search();
  });

});

TenderBlacklist.fn.load_data = function() {
  TenderBlacklist.index = lunr(function() {
    // boost increases the importance of words found in this field
    this.field('name', { boost: 10 });
    this.field('reg_no', { boost: 2 });
    this.field('reason');
    this.field('period_from');
    this.field('period_to');
    this.field('authorised_by', { boost: 5 });
    // the id
    this.ref('id');
  });

  var data = $.getJSON('/js/data.json');
  data.then(function(response) {
    $.each(response, function(index, value) {
      TenderBlacklist.index.add({
        id: index,
        name: value.name,
        reg_no: value.reg_no,
        reason: value.reason,
        period_from: value.period_from,
        period_to: value.period_to,
        authorised_by: value.authorised_by
      });
    });

    TenderBlacklist.data = response;
    TenderBlacklist.fn.search_examples();
    TenderBlacklist.fn.search_enable();

    // pym.js
    if (typeof pymChild !== 'undefined') { pymChild.sendHeight(); }
  });
};

TenderBlacklist.fn.search_examples = function() {
  var search_examples = '';
  for (var i = 2; i >= 0; i--) {
    var random_id = Math.floor(Math.random() * TenderBlacklist.data.length) + 1;
    var company = TenderBlacklist.data[random_id - 1];
    search_examples += '<a onclick="javascript:TenderBlacklist.fn.search_example(\'' + company.name + '\');">';
    search_examples += TenderBlacklist.data[random_id - 1].name + '</a>, ';
  }
  search_examples = search_examples.substring(0, search_examples.length - 2);
  $('.widget p.examples span').html(search_examples);
};

TenderBlacklist.fn.search_example = function(query) {
  $('.widget input').focus();
  $('.widget input').val(query);
  TenderBlacklist.fn.search(true);
};

TenderBlacklist.fn.search_enable = function() {
  $('.widget button').html('<i class="fa fa-btn fa-search"></i>');

  $('.widget input').prop('disabled', false);
  $('.widget button').prop('disabled', false);
};

TenderBlacklist.fn.search = function(is_example=false) {
  var query = $('.widget input').val();
  var results = TenderBlacklist.index.search(query);

  var results_html = '';
  $.each(results, function(index, value) {
    var company = TenderBlacklist.data[value.ref];
    results_html += '<li class="list-group-item">';
    results_html += '<p>' + company.name + '</p>';
    results_html += '<small><strong>Reg No:</strong> ' + company.reg_no + '</small><br/>';
    results_html += '<small><strong>Reason:</strong> ' + company.reason + '</small><br/>';
    results_html += '<small><strong>Period:</strong> ' + company.period_from + ' to ' +  company.period_to + '</small><br/>';
    results_html += '<small><strong>Authorised By:</strong> ' + company.authorised_by + '</small><br/>';
    results_html += '</li>';
  });

  if (results.length === 0) {
    results_html = '<p class="text-center"><em>No results found for "' + query + '"</em></p>';
  }

  $('.widget .results-list').html(results_html);

  $('.results').removeClass('hidden');

  // pym.js
  if (typeof pymChild !== 'undefined') { pymChild.sendHeight(); }

  // send google analytics event
  var ga_event_action = 'search';
  if (is_example) { var ga_event_action = 'search:example'; }
  ga('send', 'event', 'Search', ga_event_action, query);

};

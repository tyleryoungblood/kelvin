// allow user to check/uncheck all rooms for a given location
$(function () {
   $(".check-uncheck-all").change(function () {
      console.log($(this));
      $(this)
         .parent()
         .siblings()
         .find('input:checkbox')
         .prop('checked', this.checked)
   });
});

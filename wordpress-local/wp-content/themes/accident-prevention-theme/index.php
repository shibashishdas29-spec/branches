<?php get_header(); ?>
<div class="site-wrap">
  <?php
  if (have_posts()) {
      while (have_posts()) {
          the_post();
          the_content();
      }
  }
  ?>
</div>
<?php get_footer(); ?>

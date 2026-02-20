<?php
/**
 * Plugin Name: Accident Prevention System
 * Description: YOLO/OpenCV accident prevention dashboard embed for WordPress (Local import bundle).
 * Version: 1.0.0
 * Author: Codex
 */

if (!defined('ABSPATH')) {
    exit;
}

function aps_enqueue_assets() {
    wp_enqueue_style(
        'aps-styles',
        plugin_dir_url(__FILE__) . 'assets/css/styles.css',
        [],
        '1.0.0'
    );

    wp_enqueue_script(
        'aps-chartjs',
        'https://cdn.jsdelivr.net/npm/chart.js',
        [],
        null,
        true
    );

    wp_enqueue_script(
        'aps-app',
        plugin_dir_url(__FILE__) . 'assets/js/app.js',
        ['aps-chartjs'],
        '1.0.0',
        true
    );

    $demo_reports = [
        [
            'incidentId' => 'WP-SIM-1001',
            'timestamp' => gmdate('c'),
            'location' => 'City Ring Road - Camera C12',
            'severity' => 'Moderate',
            'survivalRate' => 82,
            'preventiveMeasures' => 'Adaptive speed signage',
            'remedialMeasures' => 'Dispatch alerted and lane secured',
            'videoFilename' => '',
        ],
    ];

    $demo_summary = [
        'bySeverity' => [
            'Critical' => 1,
            'High' => 2,
            'Moderate' => 4,
            'Low' => 3,
        ],
        'averageSurvivalRate' => 77,
        'criticalRate' => 10,
    ];

    wp_localize_script('aps-app', 'APS_BOOTSTRAP', [
        'apiBase' => esc_url_raw(home_url('/wp-json/aps/v1')),
        'demoReports' => $demo_reports,
        'demoSummary' => $demo_summary,
    ]);
}
add_action('wp_enqueue_scripts', 'aps_enqueue_assets');

function aps_shortcode() {
    ob_start();
    ?>
    <div class="aps-root">
      <div class="bg-glow"></div>
      <header class="topbar">
        <h1>Accident Prevention System</h1>
        <p>YOLOv5 + OpenCV Smart Collision Monitoring</p>
      </header>

      <main class="container">
        <section class="card detection" id="detection">
          <h2>1) Detection & Smart Road Monitoring</h2>
          <p>Upload CCTV footage or historical simulation video for accident and speed-risk analysis.</p>

          <form id="analyzeForm" class="upload-panel">
            <label class="file-input">
              <span>Select Video Feed</span>
              <input type="file" name="video" id="videoInput" accept="video/*" />
            </label>
            <div class="grid-two">
              <label>
                Camera Location
                <input type="text" name="location" id="location" placeholder="Ex: NH-48 Junction A" />
              </label>
              <label>
                Simulation Mode
                <select name="simulationMode" id="simulationMode">
                  <option value="live-upload">Live Upload</option>
                  <option value="historical">Historical Record Replay</option>
                </select>
              </label>
            </div>
            <button type="submit" id="analyzeBtn">Analyze Footage</button>
          </form>

          <div class="preview-wrap">
            <video id="videoPreview" controls playsinline></video>
            <div class="pulse-dot" aria-hidden="true"></div>
          </div>

          <div id="analysisResult" class="result hidden"></div>
        </section>

        <section class="card authorities" id="authorities">
          <h2>2) Authority Alerts & Accident Review</h2>
          <p>Trigger emergency alerts and generate detailed incident summaries with preventive/remedial actions.</p>

          <form id="alertForm" class="grid-two">
            <label>
              Incident ID
              <input type="text" id="incidentId" />
            </label>
            <label>
              Authority Contact
              <input type="text" id="authorityContact" placeholder="Traffic HQ / EMS" />
            </label>
            <label>
              Preventive Measures
              <textarea id="preventiveMeasures" rows="3"></textarea>
            </label>
            <label>
              Remedial Measures
              <textarea id="remedialMeasures" rows="3"></textarea>
            </label>
            <button type="submit">Notify Authorities</button>
          </form>

          <div id="alertStatus" class="result hidden"></div>
        </section>

        <section class="card analytics">
          <h2>Accident Summary Analytics</h2>
          <div class="chart-grid">
            <canvas id="accidentTypeChart"></canvas>
            <canvas id="survivalRateChart"></canvas>
          </div>

          <div class="table-wrap">
            <table id="reportsTable">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date/Time</th>
                  <th>Place</th>
                  <th>Severity</th>
                  <th>Survival %</th>
                  <th>Measures</th>
                  <th>Footage</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode('accident_prevention_system', 'aps_shortcode');

function aps_register_rest_routes() {
    register_rest_route('aps/v1', '/summary', [
        'methods' => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function () {
            return [
                'bySeverity' => [
                    'Critical' => 1,
                    'High' => 2,
                    'Moderate' => 4,
                    'Low' => 3,
                ],
                'averageSurvivalRate' => 77,
                'criticalRate' => 10,
            ];
        },
    ]);

    register_rest_route('aps/v1', '/reports', [
        'methods' => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function () {
            return [
                [
                    'incidentId' => 'WP-SIM-1001',
                    'timestamp' => gmdate('c'),
                    'location' => 'City Ring Road - Camera C12',
                    'severity' => 'Moderate',
                    'survivalRate' => 82,
                    'preventiveMeasures' => 'Adaptive speed signage',
                    'remedialMeasures' => 'Dispatch alerted and lane secured',
                    'videoFilename' => '',
                ],
            ];
        },
    ]);

    register_rest_route('aps/v1', '/alerts', [
        'methods' => 'POST',
        'permission_callback' => '__return_true',
        'callback' => function ($request) {
            $contact = sanitize_text_field($request->get_param('authorityContact'));
            return [
                'alert' => [
                    'authorityContact' => $contact ?: 'Authority',
                    'notifiedAt' => gmdate('c'),
                ],
            ];
        },
    ]);

    register_rest_route('aps/v1', '/analyze', [
        'methods' => 'POST',
        'permission_callback' => '__return_true',
        'callback' => function () {
            return [
                'report' => [
                    'incidentId' => 'WP-SIM-' . wp_rand(1000, 9999),
                    'severity' => 'Moderate',
                    'speedRisk' => 'Moderate',
                    'damageClass' => 'Moderate Panel/Impact Damage',
                    'survivalRate' => 79,
                ],
            ];
        },
    ]);
}
add_action('rest_api_init', 'aps_register_rest_routes');
